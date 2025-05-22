import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".yarn/**",        // ignora os SDKs do Yarn
      "node_modules/**", // boa prática, por garantia
      "dist/**",         // se você gera build
      "build/**",        // idem
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier,
];

export default eslintConfig;
