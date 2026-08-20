import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from 'eslint-plugin-import';
import bitriseConfig from "@bitrise/eslint-plugin";

const RAW_USE_STORE_MESSAGE =
  "This selector builds a fresh value, so raw useStore() will re-render forever. " +
  "Use useBitriseYmlStore() from '@/hooks/useBitriseYmlStore' — it applies the deep-equal useShallow. " +
  "Raw useStore(bitriseYmlStore, ...) is only for selectors returning a primitive or an existing reference.";

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
          message: `Please import useShallow from '@/hooks/useShallow' instead.`,
        },
        {
          name: "zustand/react/shallow",
          importNames: ["useShallow"],
          message: `Please import useShallow from '@/hooks/useShallow' instead.`,
        },
      ],
      // `useBitriseYmlStore` wraps every selector in the deep-equal `@/hooks/useShallow`. Calling
      // `useStore(bitriseYmlStore, ...)` directly skips that, which is correct ONLY when the selector
      // returns a primitive or an existing reference. A selector that builds a fresh object/array
      // returns a new reference on every call, so React's useSyncExternalStore re-renders forever
      // ("Maximum update depth exceeded") on mount. These patterns catch the common fresh-value
      // shapes; a fresh value built inside a block body is not detectable here.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='useStore'][arguments.0.name='bitriseYmlStore'][arguments.1.body.type='ObjectExpression']",
          message: RAW_USE_STORE_MESSAGE,
        },
        {
          selector:
            "CallExpression[callee.name='useStore'][arguments.0.name='bitriseYmlStore'][arguments.1.body.type='ArrayExpression']",
          message: RAW_USE_STORE_MESSAGE,
        },
        {
          selector:
            "CallExpression[callee.name='useStore'][arguments.0.name='bitriseYmlStore'][arguments.1.body.callee.property.name=/^(map|filter|flatMap|slice|concat|sort|reduce)$/]",
          message: RAW_USE_STORE_MESSAGE,
        },
        {
          selector:
            "CallExpression[callee.name='useStore'][arguments.0.name='bitriseYmlStore'][arguments.1.body.callee.object.name='Object']",
          message: RAW_USE_STORE_MESSAGE,
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
