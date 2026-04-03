import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const recommendedTypeScriptConfigs = Array.isArray(tseslint.configs.recommended)
  ? tseslint.configs.recommended
  : [tseslint.configs.recommended];

export const createBaseConfig = ({ ignores = [] } = {}) => [
  eslint.configs.recommended,
  ...recommendedTypeScriptConfigs,
  {
    ignores: ["node_modules/", "eslint.config.js", "eslint.config.mjs", ...ignores],
  },
];

const baseConfig = createBaseConfig();

export default baseConfig;
