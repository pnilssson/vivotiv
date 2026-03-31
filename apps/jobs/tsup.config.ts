import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts"],
  format: "esm",
  target: "node22",
  clean: true,
  noExternal: ["@vivotiv/db", "@vivotiv/shared"],
  esbuildOptions(options) {
    options.keepNames = false;
  },
});
