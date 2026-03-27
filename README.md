# Vivotiv Monorepo

Bootstrap monorepo for:

- `apps/web`, Next.js 16 app
- `apps/api`, Hono app for Vercel
- `packages/shared`, shared package shell
- `packages/db`, database package shell

## Requirements

- Node.js 22+
- pnpm 10+

## Install

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

- Web app: `http://localhost:3000`
- API app: `http://localhost:3001`

## Validate

```bash
pnpm build
pnpm lint
pnpm typecheck
```
