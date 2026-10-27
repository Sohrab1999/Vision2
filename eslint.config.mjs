import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",
    
    // React rules
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  // r400 — .standalone/ joins the ignores: it is a stale full-project mirror
  // (394MB, old BUILD_ID, own db/.env copies) that a mirror job refreshed
  // mid-r399 — the cron auto-committer then shipped 3,172 of its files into
  // git (retired in r400's hygiene commit). Its compiled .js files must never
  // be linted; the app runtime runs from .next/standalone, not this copy.
  // r456 — .next-prod169/ repeats the r399 pattern verbatim: the cron
  // auto-committer shipped a stale prod-build mirror into git after the
  // environment reset, and its compiled chunks imported 55 lint errors
  // (no-empty-object-type / no-require-imports / no-this-alias — all in
  // build output, zero in src/tests). Retired from tracking in the same
  // breath; the build script never reads it.
  ignores: ["node_modules/**", ".next/**", ".next-prod169/**", ".standalone/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills", "scripts/**"]
}];

export default eslintConfig;
