# Web app

## Required environment variables

Copy `.env.example` to `.env.local` and set values before running the app:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the API, for example `http://localhost:3001` in local dev.

This variable is required and has no hardcoded fallback in code.

## Local development

```bash
pnpm dev
```
