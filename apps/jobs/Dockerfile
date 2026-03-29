# Build from repo root: docker build -f apps/jobs/Dockerfile .
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

FROM base AS deps
COPY . .
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm --filter jobs build

FROM base AS production
RUN apt-get update && \
    npx -y playwright install-deps chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/jobs/node_modules ./apps/jobs/node_modules
COPY --from=build /app/apps/jobs/dist ./apps/jobs/dist
COPY --from=build /app/apps/jobs/package.json ./apps/jobs/
COPY --from=build /app/package.json ./

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "apps/jobs/dist/app.js"]
