import fs from "fs";
import path from "path";
// sql.js is imported dynamically inside createDb() so it is never loaded on
// the Workers runtime (which uses D1); only local Node runs load it.
import type { Database, SqlJsStatic } from "sql.js";
import { SCHEMA_SQL, seedStatements, type SeedStatement } from "./schema-seed";

export type QueryRow = Record<string, unknown>;

type D1Result = { results?: QueryRow[] };
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

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

function dbFilePath(): string {
  return path.join(process.cwd(), "data", "agriconnect.db");
}

async function createDb(): Promise<Database> {
  const { default: initSqlJs } = (await import("sql.js")) as unknown as {
    default: (opts: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
  };
  const wasmDir = path.join(process.cwd(), "node_modules", "sql.js", "dist");
  const SQL: SqlJsStatic = await initSqlJs({
    locateFile: (file: string) => path.join(wasmDir, file),
  });

  const file = dbFilePath();
  if (fs.existsSync(file)) {
    try {
      return new SQL.Database(fs.readFileSync(file));
    } catch {
      // corrupted file -> rebuild below
    }
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const database = new SQL.Database();
  database.run("PRAGMA foreign_keys = ON;");
  migrate(database);
  seedLocalDatabase(database);
  persistDatabaseTo(database, file);
  return database;
}

export async function getDatabase(): Promise<Database> {
  if (db) return db;
  if (!initPromise) {
    initPromise = createDb().then((database) => {
      db = database;
      return database;
    });
  }
  return initPromise;
}

export function persistDatabaseTo(database: Database, file: string): void {
  try {
    fs.writeFileSync(file, Buffer.from(database.export()));
  } catch {
    // persistence is best-effort; the app still works in-memory
  }
}

export async function persistDatabase(): Promise<void> {
  if (activeD1) return; // D1 is durable on its own — nothing to write back
  const database = await getDatabase();
  persistDatabaseTo(database, dbFilePath());
}

/* ------------------------------------------------------------------ */
/* Cloudflare Workers path: the platform binds a D1 database as        */
/* env.DB. The same run/all/one API serves both runtimes, so all      */
/* query code in lib/data.ts stays untouched.                         */
/* ------------------------------------------------------------------ */

let activeD1: D1Database | null = null;
let d1InitPromise: Promise<void> | null = null;

async function resolveD1(): Promise<D1Database | null> {
  if (activeD1) return activeD1;
  try {
    // Dynamic import keeps the sql.js fallback usable in plain Node runs.
    const cf = (await import("@opennextjs/cloudflare")) as {
      getCloudflareContext: (opts?: { async: boolean }) => Promise<{ env: { DB?: D1Database } } | { env: { DB?: D1Database } }>;
    };
    const ctx = await cf.getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      activeD1 = ctx.env.DB;
      return activeD1;
    }
  } catch {
    // Not running under the OpenNext adapter/miniflare -> sql.js fallback.
  }
  return null;
}

async function ensureD1Schema(d1: D1Database): Promise<void> {
  if (d1InitPromise) return d1InitPromise;
  d1InitPromise = (async () => {
    await d1.exec(SCHEMA_SQL);
    const existing = await d1.prepare("SELECT id FROM users LIMIT 1").bind().all();
    if (!existing.results || existing.results.length === 0) {
      // D1 batch runs transactionally: either the full seed lands, or nothing.
      const inserts = seedStatements();
      await d1.batch(inserts.map((s) => d1.prepare(s.sql).bind(...s.params)));
    }
  })().catch((err) => {
    d1InitPromise = null;
    throw err;
  });
  return d1InitPromise;
}

/* ------------------------------------------------------------------ */
/* Runtime-agnostic query API                                          */
/* ------------------------------------------------------------------ */

/** Run a statement (INSERT / UPDATE / DELETE) with bound params. */
export async function run(sql: string, params: unknown[] = []): Promise<void> {
  const d1 = await resolveD1();
  if (d1) {
    await ensureD1Schema(d1);
    await d1.prepare(sql).bind(...params).run();
    return;
  }
  const database = await getDatabase();
  database.run(sql, params as never);
  await persistDatabase();
}

/** Fetch all rows for a SELECT as plain objects. */
export async function all<T = QueryRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const d1 = await resolveD1();
  if (d1) {
    await ensureD1Schema(d1);
    const result = await d1.prepare(sql).bind(...params).all();
    return (result.results ?? []) as T[];
  }
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  try {
    stmt.bind(params as never);
    const out: T[] = [];
    while (stmt.step()) out.push(stmt.getAsObject() as T);
    return out;
  } finally {
    stmt.free();
  }
}

/** Fetch a single row or null. */
export async function one<T = QueryRow>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/* ------------------------------------------------------------------ */
/* Local (sql.js) seeder                                              */
/* ------------------------------------------------------------------ */

function migrate(database: Database): void {
  SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((s) => database.run(s));
}

function seedLocalDatabase(database: Database): void {
  for (const stmt of seedStatements()) {
    database.run(stmt.sql, stmt.params as never);
  }
}
