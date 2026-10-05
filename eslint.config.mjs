import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Next's plugins still use rule APIs removed in ESLint 10.
  ...fixupConfigRules([...nextVitals, ...nextTs]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    ".uv-cache/**",
    ".venv/**",
    ".superpowers/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
