import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "**/*", // Ignore all files to effectively disable ESLint
    ],
  },
  {
    rules: {
      // Disable all rules
      "prefer-const": "off",
      "@typescript-eslint/prefer-const": "off",
    },
  },
];

export default eslintConfig;
