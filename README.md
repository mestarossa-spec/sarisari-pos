# Sari-Sari POS

A simple Point-of-Sale and Inventory Management system built for a Filipino sari-sari store (neighborhood convenience store). Single-admin, no customer accounts — designed for a store owner to track stock and log sales at the counter.

## Features

- **Admin login** — secure, session-based authentication (30-day sessions)
- **Product management** — add, edit, delete products with stock tracking and low-stock alerts
- **Point of Sale** — tap-to-cart product selection, automatic stock deduction, Cash/GCash payment logging
- **Sales history** — full log of past transactions with itemized breakdowns
- **Low-stock dashboard** — at-a-glance view of products running low

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Database:** [TiDB Serverless](https://www.pingcap.com/tidb-serverless/) (MySQL-compatible)
- **ORM:** [Prisma](https://www.prisma.io) with [`@tidbcloud/prisma-adapter`](https://www.npmjs.com/package/@tidbcloud/prisma-adapter) (driver adapter — no native binary engine, fully compatible with serverless deployment)
- **Auth:** [Auth.js](https://authjs.dev) (Credentials provider)
- **Hosting:** [Vercel](https://vercel.com)

## Getting Started

```bash
npm install
```

Create a `.env` file with:

DATABASE_URL="mysql://user:password@host:4000/database?sslaccept=strict"
AUTH_SECRET="your-generated-secret"
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-admin-password"


Push the schema to your database:
```bash
npx prisma db push
```

Run the dev server:
```bash
npm run dev
```

## License

Personal portfolio project by Kenji Granado