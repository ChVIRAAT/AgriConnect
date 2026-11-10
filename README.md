# AgriConnect — Farm to Consumer

AgriConnect is a Next.js marketplace connecting farmers directly with consumers. It includes farmer and consumer accounts, crop discovery and listings, farmer profiles, inquiries, and role-based dashboards. The app uses Turso/libSQL through `@libsql/client`.

## Requirements

- Node.js 20.9 or newer
- A Turso/libSQL database

## Environment

Create `.env.local` in the project root and set:

```env
TURSO_DATABASE_URL=libsql://your-database-host
TURSO_AUTH_TOKEN=your-database-auth-token
```

Keep `.env.local` private; it is ignored by Git. These values are server-only and must not use a `NEXT_PUBLIC_` prefix.

## Run and verify

```bash
npm install
npm run db:check
npm run dev
```

The AgriConnect homepage is served at `http://localhost:3210`. Run `npm run build` to create a production build and `npm start` to serve it. Run `npm run typecheck` to check TypeScript.

The app applies repeatable, transactional schema migrations and preserves existing records. Farmers can publish, edit, hide, and manage crop listings; customers can submit inquiries and order requests. Farmers manage inquiry replies and order status from their dashboard. An order remains pending until accepted, and available stock is deducted only on acceptance. Customers can cancel pending requests; accepted orders are completed by the farmer.

AgriConnect does not currently integrate an online payment provider. Order totals are informational; customers and farmers arrange payment and delivery directly. No payment is collected or marked successful by the application.
