<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Web search latest docs before writing any code. Heed deprecation notices.

## Known breaking changes (Next.js 16)

- `middleware.ts` is replaced by `proxy.ts`. The file is at `src/proxy.ts` and serves the same purpose (request interception, rewrites, redirects). Do NOT create `middleware.ts` — it does not exist in Next.js 16.
<!-- END:nextjs-agent-rules -->
