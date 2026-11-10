import {
  createClient,
  type Client,
  type InValue,
} from "@libsql/client";

import { hashPassword } from "./auth";
import {
  SEED_USER_EMAILS,
  SCHEMA_SQL,
  seedStatements,
} from "./schema-seed";

export type QueryRow = Record<string, unknown>;

let client: Client | null = null;
let initPromise: Promise<void> | null = null;
const INQUIRY_CONSUMER_MIGRATION = "inquiries_nullable_consumer_v1";
const INQUIRY_RESPONSE_MIGRATION = "inquiry_farmer_response_v1";
const DEMO_SEED_MIGRATION = "demo_seed_v2";

/* ---------------------------------------
   Create Turso connection
--------------------------------------- */

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    throw new Error(
      "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Check your .env.local file."
    );
  }

  client = createClient({
    url,
    authToken,
  });

  return client;
}

/* ---------------------------------------
   Initialize database and tables
--------------------------------------- */

async function initializeDatabase(): Promise<void> {
  const database = getClient();

  await database.executeMultiple(SCHEMA_SQL);
  await migrateNullableInquiryConsumer(database);
  await migrateInquiryResponses(database);

  const migration = await database.execute({
    sql: "SELECT id FROM schema_migrations WHERE id = ?",
    args: [DEMO_SEED_MIGRATION],
  });
  if (migration.rows.length > 0) return;

  const seedUserPlaceholders = SEED_USER_EMAILS.map(() => "?").join(", ");
  const existingUsers = await database.execute({
    sql: `SELECT COUNT(*) AS total,
                 SUM(CASE WHEN email IN (${seedUserPlaceholders}) THEN 1 ELSE 0 END) AS seeded
          FROM users`,
    args: SEED_USER_EMAILS,
  });
  const row = existingUsers.rows[0];
  if (Number(row?.total ?? 0) > 0 && Number(row?.seeded ?? 0) === 0) return;

  const transaction = await database.transaction("write");
  try {
    const alreadyApplied = await transaction.execute({
      sql: "SELECT id FROM schema_migrations WHERE id = ?",
      args: [DEMO_SEED_MIGRATION],
    });

    if (alreadyApplied.rows.length === 0) {
      const users = await transaction.execute({
        sql: `SELECT COUNT(*) AS total,
                     SUM(CASE WHEN email IN (${seedUserPlaceholders}) THEN 1 ELSE 0 END) AS seeded
              FROM users`,
        args: SEED_USER_EMAILS,
      });
      const current = users.rows[0];
      const hasUsers = Number(current?.total ?? 0) > 0;
      const hasSeedUsers = Number(current?.seeded ?? 0) > 0;

      if (!hasUsers || hasSeedUsers) {
        const legacySeedUsers = await transaction.execute(
          "SELECT id FROM users WHERE password_hash LIKE '$SEED$%'"
        );
        for (const user of legacySeedUsers.rows) {
          const userId = Number(user.id);
          if (!Number.isSafeInteger(userId)) {
            throw new Error("Cannot migrate a legacy demo account with an invalid user ID.");
          }
          await transaction.execute({
            sql: "UPDATE users SET password_hash = ? WHERE id = ? AND password_hash LIKE '$SEED$%'",
            args: [hashPassword("farm123"), userId],
          });
        }

        for (const statement of seedStatements()) {
          await transaction.execute({
            sql: statement.sql,
            args: statement.params as InValue[],
          });
        }

        await transaction.execute({
          sql: "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
          args: [DEMO_SEED_MIGRATION, new Date().toISOString()],
        });
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
}

async function migrateInquiryResponses(database: Client): Promise<void> {
  const migration = await database.execute({
    sql: "SELECT id FROM schema_migrations WHERE id = ?",
    args: [INQUIRY_RESPONSE_MIGRATION],
  });
  if (migration.rows.length > 0) return;

  const transaction = await database.transaction("write");
  try {
    const alreadyApplied = await transaction.execute({
      sql: "SELECT id FROM schema_migrations WHERE id = ?",
      args: [INQUIRY_RESPONSE_MIGRATION],
    });
    if (alreadyApplied.rows.length > 0) {
      await transaction.commit();
      return;
    }

    const columns = await transaction.execute("PRAGMA table_info(inquiries)");
    const columnNames = new Set(columns.rows.map((column) => column.name));
    if (!columnNames.has("farmer_response")) {
      await transaction.execute("ALTER TABLE inquiries ADD COLUMN farmer_response TEXT");
    }
    if (!columnNames.has("responded_at")) {
      await transaction.execute("ALTER TABLE inquiries ADD COLUMN responded_at TEXT");
    }
    await transaction.execute(
      "CREATE INDEX IF NOT EXISTS inquiries_farmer_response_idx ON inquiries (farmer_id, status, responded_at)"
    );
    await transaction.execute({
      sql: "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
      args: [INQUIRY_RESPONSE_MIGRATION, new Date().toISOString()],
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
}

async function migrateNullableInquiryConsumer(database: Client): Promise<void> {
  const applied = await database.execute({
    sql: "SELECT id FROM schema_migrations WHERE id = ?",
    args: [INQUIRY_CONSUMER_MIGRATION],
  });
  if (applied.rows.length > 0) return;

  const transaction = await database.transaction("write");
  try {
    const alreadyApplied = await transaction.execute({
      sql: "SELECT id FROM schema_migrations WHERE id = ?",
      args: [INQUIRY_CONSUMER_MIGRATION],
    });
    if (alreadyApplied.rows.length > 0) {
      await transaction.commit();
      return;
    }

    const columns = await transaction.execute("PRAGMA table_info(inquiries)");
    const consumerColumn = columns.rows.find((column) => column.name === "consumer_id");
    if (!consumerColumn) {
      throw new Error("Cannot migrate inquiries: consumer_id column is missing.");
    }

    if (Number(consumerColumn.notnull) !== 0) {
      const dependents = await transaction.execute(
        "SELECT sql FROM sqlite_master WHERE tbl_name = 'inquiries' AND type IN ('index', 'trigger') AND sql IS NOT NULL"
      );
      await transaction.execute(`
        CREATE TABLE inquiries_nullable_migration (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          crop_id INTEGER NOT NULL REFERENCES crops(id),
          consumer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          farmer_id INTEGER NOT NULL REFERENCES users(id),
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          message TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
          created_at TEXT NOT NULL
        )
      `);
      await transaction.execute(`
        INSERT INTO inquiries_nullable_migration
          (id, crop_id, consumer_id, farmer_id, name, phone, email, message, quantity, status, created_at)
        SELECT id, crop_id, consumer_id, farmer_id, name, phone, email, message, quantity, status, created_at
        FROM inquiries
      `);
      await transaction.execute("DROP TABLE inquiries");
      await transaction.execute(
        "ALTER TABLE inquiries_nullable_migration RENAME TO inquiries"
      );

      for (const dependent of dependents.rows) {
        if (typeof dependent.sql === "string") {
          await transaction.execute(dependent.sql);
        }
      }
    }

    await transaction.execute({
      sql: "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
      args: [INQUIRY_CONSUMER_MIGRATION, new Date().toISOString()],
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
}

/* ---------------------------------------
   Get initialized database
--------------------------------------- */

export async function getDatabase(): Promise<Client> {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  await initPromise;

  return getClient();
}

/* ---------------------------------------
   Run INSERT / UPDATE / DELETE
--------------------------------------- */

export async function run(
  sql: string,
  params: unknown[] = []
): Promise<void> {
  const database = await getDatabase();

  await database.execute({
    sql,
    args: params as InValue[],
  });
}

/* ---------------------------------------
   Fetch multiple rows
--------------------------------------- */

export async function all<T = QueryRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const database = await getDatabase();

  const result = await database.execute({
    sql,
    args: params as InValue[],
  });

  return result.rows.map((row) => Object.fromEntries(Object.entries(row))) as T[];
}

/* ---------------------------------------
   Fetch a single row or null
--------------------------------------- */

export async function one<T = QueryRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await all<T>(sql, params);

  return rows.length > 0 ? rows[0] : null;
}

/* ---------------------------------------
   Turso automatically persists data.
   No local database file is required.
--------------------------------------- */

export async function persistDatabase(): Promise<void> {
  await getDatabase();
}