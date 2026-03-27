# API app, Hono on Vercel

## Install

```bash
pnpm install
```

## Local dev

```bash
pnpm dev
```

The API runs at `http://localhost:3001`.

## CORS configuration

This API applies CORS on `/v1/*`.

Current behavior is permissive and allows all origins.

```ts
origin: "*"
```

We can tighten this with an allowlist later.

## Build and validate

```bash
pnpm build
pnpm lint
pnpm typecheck
```
