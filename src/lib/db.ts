import fs from "node:fs";
import path from "node:path";

// Load sql.js only when running locally.
// Cloudflare Workers use D1 instead.
import type { Database, SqlJsStatic } from "sql.js";

import {
  SCHEMA_SQL,
  seedStatements,
  type SeedStatement,
} from "./schema-seed";

export type QueryRow = Record<string, unknown>;

type D1Result = {
  results?: QueryRow[];
};

type D1Statement = {
  bind: (...params: unknown[]) => {
    run: () => Promise<unknown>;
    all: () => Promise<D1Result>;
  };
};

type D1Database = {
  prepare: (sql: string) => D1Statement;
  batch: (stmts: unknown[]) => Promise<unknown>;
  exec: (sql: string) => Promise<unknown>;
};

// Local database state
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

// Cloudflare D1 state
let activeD1: D1Database | null = null;
let d1InitPromise: Promise<void> | null = null;

/* -------------------------------------------------- */
/* LOCAL DATABASE PATH                                */
/* -------------------------------------------------- */

function dbFilePath(): string {
  return path.join(process.cwd(), "data", "agriconnect.db");
}

/* -------------------------------------------------- */
/* DATABASE MIGRATION                                 */
/* -------------------------------------------------- */

function migrate(database: Database): void {
  const statements = SCHEMA_SQL
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    database.run(statement);
  }
}

/* -------------------------------------------------- */
/* LOCAL DATABASE SEEDING                             */
/* -------------------------------------------------- */

function seedLocalDatabase(database: Database): void {
  const existingUsers = database.exec(
    "SELECT id FROM users LIMIT 1"
  );

  // Avoid inserting sample data more than once.
  if (
    existingUsers.length > 0 &&
    existingUsers[0].values.length > 0
  ) {
    return;
  }

  const statements: SeedStatement[] = seedStatements();

  for (const statement of statements) {
    database.run(
      statement.sql,
      statement.params as never
    );
  }
}

/* -------------------------------------------------- */
/* SAVE LOCAL DATABASE                                */
/* -------------------------------------------------- */

export function persistDatabaseTo(
  database: Database,
  file: string
): void {
  try {
    const directory = path.dirname(file);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(
      file,
      Buffer.from(database.export())
    );
  } catch (error) {
    console.error("Database persistence error:", error);
  }
}

/* -------------------------------------------------- */
/* CREATE LOCAL SQLITE DATABASE                       */
/* -------------------------------------------------- */

async function createDb(): Promise<Database> {
  const { default: initSqlJs } =
    (await import("sql.js")) as unknown as {
      default: (options: {
        locateFile: (file: string) => string;
      }) => Promise<SqlJsStatic>;
    };

  const wasmDirectory = path.join(
    process.cwd(),
    "node_modules",
    "sql.js",
    "dist"
  );

  const SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(wasmDirectory, file),
  });

  const file = dbFilePath();

  let database: Database;

  // Load existing database if available.
  if (fs.existsSync(file)) {
    try {
      database = new SQL.Database(
        fs.readFileSync(file)
      );
    } catch (error) {
      console.warn(
        "Existing database is corrupted. Creating a new database.",
        error
      );

      database = new SQL.Database();
    }
  } else {
    database = new SQL.Database();
  }

  // Enable foreign key relationships.
  database.run("PRAGMA foreign_keys = ON;");

  // Create or update tables.
  migrate(database);

  // Insert sample data only if users table is empty.
  seedLocalDatabase(database);

  // Save database to disk.
  persistDatabaseTo(database, file);

  return database;
}

/* -------------------------------------------------- */
/* GET LOCAL DATABASE                                 */
/* -------------------------------------------------- */

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  if (!initPromise) {
    initPromise = createDb()
      .then((database) => {
        db = database;
        return database;
      })
      .catch((error) => {
        initPromise = null;
        throw error;
      });
  }

  return initPromise;
}

/* -------------------------------------------------- */
/* PERSIST DATABASE                                   */
/* -------------------------------------------------- */

export async function persistDatabase(): Promise<void> {
  if (activeD1) {
    return;
  }

  const database = await getDatabase();

  persistDatabaseTo(
    database,
    dbFilePath()
  );
}

/* -------------------------------------------------- */
/* CLOUDFLARE D1 CONNECTION                           */
/* -------------------------------------------------- */

async function resolveD1(): Promise<D1Database | null> {
  if (activeD1) {
    return activeD1;
  }

  try {
    const cf = await import("@opennextjs/cloudflare");

    const ctx = await cf.getCloudflareContext({
      async: true,
    });

    const env = ctx.env as unknown as {
      DB?: D1Database;
    };

    if (env.DB) {
      activeD1 = env.DB;
      return activeD1;
    }
  } catch (error) {
    console.warn(
      "Cloudflare D1 unavailable. Using local SQLite.",
      error
    );
  }

  return null;
}

/* -------------------------------------------------- */
/* INITIALIZE CLOUDFLARE D1                           */
/* -------------------------------------------------- */

async function ensureD1Schema(
  d1: D1Database
): Promise<void> {
  if (d1InitPromise) {
    return d1InitPromise;
  }

  d1InitPromise = (async () => {
    // Create database tables.
    await d1.exec(SCHEMA_SQL);

    // Check whether sample users already exist.
    const existing = await d1
      .prepare("SELECT id FROM users LIMIT 1")
      .bind()
      .all();

    if (
      !existing.results ||
      existing.results.length === 0
    ) {
      const statements = seedStatements();

      const inserts = statements.map((statement) =>
        d1
          .prepare(statement.sql)
          .bind(...statement.params)
      );

      // Insert all sample records transactionally.
      await d1.batch(inserts);
    }
  })().catch((error) => {
    d1InitPromise = null;
    throw error;
  });

  return d1InitPromise;
}

/* -------------------------------------------------- */
/* RUN INSERT / UPDATE / DELETE QUERIES               */
/* -------------------------------------------------- */

export async function run(
  sql: string,
  params: unknown[] = []
): Promise<void> {
  const d1 = await resolveD1();

  if (d1) {
    await ensureD1Schema(d1);

    await d1
      .prepare(sql)
      .bind(...params)
      .run();

    return;
  }

  const database = await getDatabase();

  database.run(sql, params as never);

  await persistDatabase();
}

/* -------------------------------------------------- */
/* FETCH MULTIPLE ROWS                                */
/* -------------------------------------------------- */

export async function all<T = QueryRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const d1 = await resolveD1();

  if (d1) {
    await ensureD1Schema(d1);

    const result = await d1
      .prepare(sql)
      .bind(...params)
      .all();

    return (result.results ?? []) as T[];
  }

  const database = await getDatabase();

  const statement = database.prepare(sql);

  try {
    statement.bind(params as never);

    const rows: T[] = [];

    while (statement.step()) {
      rows.push(
        statement.getAsObject() as T
      );
    }

    return rows;
  } finally {
    statement.free();
  }
}

/* -------------------------------------------------- */
/* FETCH A SINGLE ROW                                 */
/* -------------------------------------------------- */

export async function one<T = QueryRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await all<T>(sql, params);

  return rows.length > 0 ? rows[0] : null;
}