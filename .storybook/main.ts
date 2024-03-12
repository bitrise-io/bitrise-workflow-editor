import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
	stories: ["../source/**/*.stories.tsx"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-onboarding",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/react-webpack5",
		options: {
			builder: {
				useSWC: true,
				fastRefresh: true,
			},
		},
	},
	swc: () => ({
		jsc: {
			transform: {
				react: {
					runtime: 'automatic',
				},
			},
		},
	}),
	docs: {
		autodocs: false
	},
	refs: {
		'@chakra-ui/react': { disable: true }
	},
	webpackFinal: async (config) => {
		if (config.module?.rules) {
			config.module.rules.push({
				test: /.*\/bitkit\/.*tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: { transpileOnly: true, configFile: require.resolve('@bitrise/bitkit/src/tsconfig.json') },
					},
				],
			});
		}
		return config;
	},
	typescript: {
		reactDocgen: false,
	},
};

export default config;
