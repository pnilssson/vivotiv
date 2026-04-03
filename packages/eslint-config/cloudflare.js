import globals from "globals";

import { createBaseConfig } from "./base.js";

const cloudflareConfig = [
  ...createBaseConfig({
    ignores: ["dist/", ".wrangler/"],
  }),
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
];

export default cloudflareConfig;
