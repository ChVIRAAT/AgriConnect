const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@libsql/client");
const { randomUUID } = require("node:crypto");

loadEnvConfig(__dirname);

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in the project environment.");
  process.exit(1);
}

if (!/^libsqls?:\/\/[^\s]+$/.test(url)) {
  console.error("TURSO_DATABASE_URL must use the libsql:// or libsqls:// scheme.");
  process.exit(1);
}

const client = createClient({ url, authToken });

(async () => {
  try {
    const result = await client.execute("SELECT 1 AS ok");
    if (result.rows[0]?.ok !== 1) {
      throw new Error("The database returned an unexpected result for SELECT 1.");
    }

    const email = `db-check-${randomUUID()}@invalid.test`;
    const tx = await client.transaction("write");
    try {
      await tx.execute({
        sql: `INSERT INTO users (name, email, password_hash, role, created_at)
              VALUES (?, ?, ?, ?, ?)`,
        args: ["Connectivity check", email, "temporary-hash", "consumer", new Date().toISOString()],
      });
      const inserted = await tx.execute({
        sql: "SELECT email FROM users WHERE email = ?",
        args: [email],
      });
      if (inserted.rows[0]?.email !== email) {
        throw new Error("The transaction could not read back its temporary test row.");
      }
    } finally {
      await tx.rollback();
    }

    const afterRollback = await client.execute({
      sql: "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      args: [email],
    });
    if (Number(afterRollback.rows[0]?.count) !== 0) {
      throw new Error("The temporary database test row remained after rollback.");
    }
    console.log("Turso connection and transactional read/write check succeeded.");
  } catch (error) {
    let message = error instanceof Error ? error.message : "Unknown connection error.";
    message = message
      .replaceAll(authToken, "[redacted token]")
      .replaceAll(url, "[redacted database URL]")
      .replace(/libsqls?:\/\/[^\s"'`]+/gi, "[redacted database URL]")
      .replace(/[\r\n]+/g, " ");
    const status = error?.status ?? error?.statusCode ?? error?.response?.status;
    console.error("Turso connection failed:", JSON.stringify({
      code: error?.code,
      httpStatus: status,
      message,
    }));
    process.exitCode = 1;
  } finally {
    client.close();
  }
})();
