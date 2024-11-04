import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: {
      react: pluginReact,
      import: importPlugin,
    },
    rules: {
      "no-console": "warn",
      "import/first": "error",
      "react/prop-types": "off",
      "linebreak-style": ["error", "unix"],
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.recommended,
  prettier,
];
