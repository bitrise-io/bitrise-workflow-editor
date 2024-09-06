import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "path";

const config: StorybookConfig = {
  stories: ["../source/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
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
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              configFile: require.resolve("@bitrise/bitkit/src/tsconfig.json"),
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
        "@/services/app-service": path.resolve(__dirname, "../source/javascripts/services/app-service.mock.ts"),
        "@": path.resolve(__dirname, "../source/javascripts"),
      },
    };

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
