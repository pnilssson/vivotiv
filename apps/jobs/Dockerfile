# Build from repo root: docker build -f apps/jobs/Dockerfile .
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# Install dependencies first (layer caching)
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/jobs/package.json ./apps/jobs/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Copy source and build
FROM deps AS build
COPY . .
RUN pnpm --filter jobs build
RUN pnpm --filter jobs --prod deploy --legacy /deploy

FROM node:22-slim AS production
WORKDIR /app

# Install tini for proper PID 1 signal handling
RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

# Install only Chromium + system deps (skips Firefox and WebKit)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright@1.58.2 install --with-deps chromium \
    && rm -rf /root/.npm /tmp/* /var/lib/apt/lists/* /var/cache/apt/*

# Resolve Chrome binary for chrome-launcher (used by Lighthouse)
RUN CHROME_BIN=$(find /ms-playwright -name "chrome" -path "*/chromium-*/chrome-linux64/chrome" | head -1) && \
    ln -s "${CHROME_BIN}" /usr/local/bin/chrome
ENV CHROME_PATH="/usr/local/bin/chrome"

# Copy only production dependencies and built app
COPY --from=build /deploy/node_modules ./node_modules
COPY --from=build /app/apps/jobs/dist ./dist
COPY --from=build /deploy/package.json ./

# Non-root user for security (Chromium sandbox)
RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser && chown -R appuser:appuser /home/appuser /app /ms-playwright
USER appuser

EXPOSE 3001
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => {if(!r.ok) throw 1})" || exit 1

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/app.js"]
