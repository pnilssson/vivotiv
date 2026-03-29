# apps/jobs -- Setup Implementation Plan

Compute service for background jobs (scan pipeline, future migration platform). Hono + Inngest on Railway in a Docker container.

## Architecture decisions

- **Entry file**: `app.ts` (matches API convention)
- **Database**: Supabase transaction pooler URL (port 6543), same as API
- **Migrations**: Handled by `deploy-api.yml` only. Jobs workflow does not run migrations.
- **Deploy**: GitHub Actions builds Docker image, pushes to GHCR, deploys to Railway via CLI
- **Chromium**: System deps installed in Docker image from day one (browser binary added when scan pipeline is implemented)

## File structure

```
apps/jobs/
  Dockerfile
  .dockerignore
  package.json
  tsconfig.json
  src/
    app.ts                          # Hono app + @hono/node-server
    env.ts                          # Environment variable validation
    inngest/
      client.ts                     # Inngest client instance
      functions/
        scan.ts                     # Placeholder scan.requested function
        index.ts                    # Re-exports all functions
    features/
      health/
        routes.ts                   # GET /health
```

## Todo list

### 1. Scaffold `apps/jobs` package

- [ ] **Docs checkpoint**: Web search latest `hono` docs for `@hono/node-server` setup
- [ ] **Docs checkpoint**: Web search latest `inngest` docs for Hono serve handler setup
- [ ] Create `apps/jobs/package.json` with dependencies:
  - `hono`, `@hono/node-server`, `inngest`, `@vivotiv/db`, `@vivotiv/shared`, `@sentry/node`, `posthog-node`
  - Dev: `typescript`, `tsx`, `@types/node`
- [ ] Create `apps/jobs/tsconfig.json` extending `../../tsconfig.base.json`
  - Target: `ES2022`, Module: `NodeNext`, ModuleResolution: `NodeNext`
  - No Cloudflare types
- [ ] Run `pnpm install` from root to verify workspace resolution

### 2. Create Hono app entry point

- [ ] Create `apps/jobs/src/env.ts`
  - Validate: `PORT`, `DATABASE_URL`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `SENTRY_DSN`, `POSTHOG_KEY`
- [ ] Create `apps/jobs/src/features/health/routes.ts`
  - `GET /health` returns `{ ok: true }` (matches API pattern)
- [ ] Create `apps/jobs/src/app.ts`
  - Hono app with health routes
  - Inngest serve handler mounted at `/api/inngest`
  - `@hono/node-server` serve on `process.env.PORT || 3001`
- [ ] Verify: `pnpm --filter jobs dev` starts and `/health` responds

### 3. Set up Inngest client and placeholder function

- [ ] **Docs checkpoint**: Web search latest `inngest` docs for client setup, event typing, and function definition patterns
- [ ] Create `apps/jobs/src/inngest/client.ts`
  - Inngest client with ID `"vivotiv"`
  - Type-safe event definitions for `"scan.requested"`
- [ ] Create `apps/jobs/src/inngest/functions/scan.ts`
  - Listens for `"scan.requested"` event with `{ leadId: string, url: string }`
  - Placeholder: logs event, returns `{ status: "placeholder" }`
- [ ] Create `apps/jobs/src/inngest/functions/index.ts`
  - Re-exports all functions as array
- [ ] Verify: Inngest dev server sees the function at `/api/inngest`

### 4. Create Dockerfile

- [ ] **Docs checkpoint**: Web search latest `playwright` docs for Dockerfile / Docker system dependencies
- [ ] Create `apps/jobs/.dockerignore` (node_modules, .git, dist, etc.)
- [ ] Create `apps/jobs/Dockerfile`
  - Multi-stage: base (node:22-slim + pnpm) -> deps -> build -> production
  - Production stage installs Chromium system deps (`npx playwright install-deps chromium`)
  - Uses pnpm deploy or workspace filtering for minimal production image
  - Exposes PORT, runs `node dist/app.js`
- [ ] Verify: `docker build -t vivotiv-jobs apps/jobs` succeeds locally

### 5. Create GitHub Actions workflow

- [ ] **Docs checkpoint**: Web search latest Railway CLI deploy docs for Docker image deployment via GitHub Actions
- [ ] Create `.github/workflows/deploy-jobs.yml`
  - Trigger: push to `main` when `apps/jobs/**`, `packages/shared/**`, or `packages/db/**` change
  - Also trigger on `workflow_dispatch` for manual deploys
  - No migration step (handled by API workflow)
  - Build Docker image, push to GHCR
  - Deploy to Railway via `railway up` or Railway CLI
  - Required secrets: `RAILWAY_TOKEN`
- [ ] Verify: Workflow syntax is valid

### 6. Wire Inngest event sending from CF Worker API

- [ ] **Docs checkpoint**: Web search Inngest REST API docs for sending events without SDK
- [ ] Update `apps/api/src/env.ts`: Add `INNGEST_EVENT_KEY` to Bindings
- [ ] Update `apps/api/wrangler.json`: Add `INNGEST_EVENT_KEY` placeholder var
- [ ] Update `apps/api/src/features/scan/service.ts`:
  - After creating the lead, POST event to `https://inn.gs/e/<key>`
  - Event: `{ name: "scan.requested", data: { leadId, url } }`
  - Fire-and-forget (don't block the response)
- [ ] Verify: Submitting a scan via the API sends an Inngest event

### 7. Final verification

- [ ] `pnpm typecheck` passes for all workspace packages
- [ ] `pnpm --filter jobs dev` starts cleanly
- [ ] Health check responds at `/health`
- [ ] Inngest dev server connects at `/api/inngest`
- [ ] Docker build succeeds
- [ ] End-to-end: scan submission -> Inngest event -> placeholder function executes
