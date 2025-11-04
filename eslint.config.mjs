import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from 'eslint-plugin-import';
import bitriseConfig from "@bitrise/eslint-plugin";

export default defineConfig([
  globalIgnores([
    ".ruby-lsp",
    "_bin",
    "_scripts",
    "apiserver",
    "build",
    "cmd",
    "node_modules",
    "rails",
    "release",
    "**/*.spec.js",
    "source/javascripts/lib/*.js",
  ]),

  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.react,
      importPlugin.flatConfigs.typescript,
      bitriseConfig.react,
    ],
    rules: {
      "import/no-cycle": "error",
      "@typescript-eslint/no-use-before-define": "warn",
      "no-restricted-globals": [
        "error",
        {
          name: "TEST_BITRISE_YML",
          message:
            "Do not use TEST_BITRISE_YML outside of storybook, spec or mock files.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "zustand/shallow",
          importNames: ["useShallow"],
          message: `Please import useShallow from '@/core/hooks/useShallow' instead.`,
        },
        {
          name: "zustand/react/shallow",
          importNames: ["useShallow"],
          message: `Please import useShallow from '@/core/hooks/useShallow' instead.`,
        },
      ],
    },
  },

  {
    files: ["**/*.stories.tsx"],
    extends: [
      bitriseConfig.storybookOriginal,
      bitriseConfig.storybookOverwrites,
    ],
    languageOptions: {
      globals: {
        TEST_BITRISE_YML: "readonly",
      },
    },
    rules: {
      "no-restricted-globals": "off",
      // "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    files: [".storybook/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        TEST_BITRISE_YML: "readonly",
      },
    },
    rules: {
      "no-restricted-globals": "off",
    },
  },

  {
    files: ["**/*.spec.{ts,tsx}", "**/*.mocks.ts", "**/*.mswMocks.ts"],
    extends: [bitriseConfig.tests],
    languageOptions: {
      globals: {
        yaml: "readonly",
      },
    },
    rules: {
      "no-restricted-globals": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
]);
