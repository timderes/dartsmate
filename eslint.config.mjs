import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    // Ensure 'globals' is marked as used when spread
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^globals$" },
      ],
    },
  },
  // 1. Global Ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "app/**", // Nextron output directory
      "dist/**",
      "renderer/next.config.js",
      "postcss.config.cjs",
      "vitest.config.js",
      "**/*.d.ts", // Exclude declaration files to avoid redundant linting if they are part of a project
    ],
  },

  // 2. Base ESLint Recommended Rules (applies to all files initially)
  eslint.configs.recommended,

  // 3. Configuration for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./renderer/tsconfig.json"], // Both root and renderer tsconfigs
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce 'type' over 'interface'
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // Allow underscore in names (e.g. for i18n keys)
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      // This rule is usually too strict for mixed JS/TS projects or those with complex data flows
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off", // Temporarily disable to reduce noise
    },
  },

  // 4. Configuration for Next.js files (applies to renderer TSX/TS files)
  {
    files: ["renderer/**/*.ts", "renderer/**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": ["error", "renderer/pages/"],
    },
  },

  // 5. Configuration for JavaScript files

  {
    files: ["next-i18next.config.js"],

    // This file must remain CommonJS for next-i18next to properly load it.

    // It uses 'require()' and Node.js globals which are otherwise flagged.

    rules: {
      "@typescript-eslint/no-require-imports": "off",

      "no-undef": "off",
    },
  },

  // 6. Prettier (Disables conflicting ESLint rules)

  prettierConfig,
);
