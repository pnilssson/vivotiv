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

FROM mcr.microsoft.com/playwright:v1.58.2-noble AS production
WORKDIR /app

# Resolve Chrome binary from Playwright image (version-agnostic)
RUN CHROME_BIN=$(find /ms-playwright -name "chrome" -path "*/chromium-*/chrome-linux64/chrome" | head -1) && \
    echo "CHROME_PATH=${CHROME_BIN}" >> /etc/environment && \
    ln -s "${CHROME_BIN}" /usr/local/bin/chrome
ENV CHROME_PATH="/usr/local/bin/chrome"

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/jobs/node_modules ./apps/jobs/node_modules
COPY --from=build /app/apps/jobs/dist ./apps/jobs/dist
COPY --from=build /app/apps/jobs/package.json ./apps/jobs/
COPY --from=build /app/package.json ./

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "apps/jobs/dist/app.js"]
