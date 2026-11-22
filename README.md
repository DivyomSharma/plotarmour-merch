This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

`npm test` runs the Vitest suite (lead validation, domain state machines, Prisma schema invariants). `npx prisma validate` checks the data model offline; set `DATABASE_URL` to the dummy value in `.env.example` for that command.

On Windows, run `npm test` from PowerShell or cmd. In some Git Bash setups Vitest fails with `Cannot read properties of undefined (reading 'config')` and reports no tests; this is an environment quirk, not a test failure.

### Real-Postgres concurrency tests

`src/lib/server/concurrency.realdb.test.ts` proves the double-accept and double-webhook races against a real PostgreSQL (parallel connections, real SERIALIZABLE conflicts). It is skipped unless `REAL_DATABASE_URL` points at a **disposable** server, for example `postgresql://postgres@127.0.0.1:56432/postgres`. The suite creates its own uniquely named database on that server and drops it afterwards; it never uses any default URL, so never point it at a server whose other databases you care about.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
