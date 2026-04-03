import { createBaseConfig } from "./base.js";

const backendConfig = createBaseConfig({
  ignores: ["dist/"],
});

export default backendConfig;
