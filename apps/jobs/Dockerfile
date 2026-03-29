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
RUN pnpm --filter jobs --prod deploy --legacy /deploy

FROM node:22-slim AS production
WORKDIR /app

# Install only Chromium + system deps (skips Firefox and WebKit)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright@1.58.2 install --with-deps chromium

# Resolve Chrome binary for chrome-launcher (used by Lighthouse)
RUN CHROME_BIN=$(find /ms-playwright -name "chrome" -path "*/chromium-*/chrome-linux64/chrome" | head -1) && \
    ln -s "${CHROME_BIN}" /usr/local/bin/chrome
ENV CHROME_PATH="/usr/local/bin/chrome"

# Copy only production dependencies and built app
COPY --from=build /deploy/node_modules ./node_modules
COPY --from=build /app/apps/jobs/dist ./dist
COPY --from=build /deploy/package.json ./

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/app.js"]
