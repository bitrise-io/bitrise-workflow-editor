import path from "path";
import YAML from "yaml";
import { readFileSync } from "fs";
import { DefinePlugin } from "webpack";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../source/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-queryparams",
    "@storybook/addon-webpack5-compiler-swc",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      builder: {
        fastRefresh: true,
      },
    },
  },
  swc: () => ({
    jsc: {
      transform: {
        react: {
          runtime: "automatic",
        },
      },
    },
  }),
  docs: {
    autodocs: false,
  },
  refs: {
    "@chakra-ui/react": { disable: true },
  },
  webpackFinal: async (config) => {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /.*\/bitkit\/.*tsx?$/,
        use: [
          {
            loader: "swc-loader",
            options: {
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
            },
          },
        ],
      });
    }

    const resolve = config.resolve || {};
    const alias = resolve.alias || {};
    config.resolve = {
      ...resolve,
      alias: {
        ...alias,
        "@": path.resolve(__dirname, "../source/javascripts"),
      },
    };

    const testBitriseYmlFile = path.resolve(__dirname, "..", "spec", "integration", "test_bitrise.yml")
    config.plugins?.push(
      new DefinePlugin({
        TEST_BITRISE_YML: DefinePlugin.runtimeValue(() => JSON.stringify(YAML.parse(readFileSync(testBitriseYmlFile, "utf8"))), {
          fileDependencies: [testBitriseYmlFile],
        }),
      })
    )

    return config;
  },
  typescript: {
    reactDocgen: false,
  },
  staticDirs: [
    {
      from: "./public",
      to: "/",
    },
  ],
};

export default config;
