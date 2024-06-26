import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
	stories: ["../source/**/*.stories.tsx"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-onboarding",
		"@storybook/addon-interactions",
		"@storybook/addon-webpack5-compiler-swc"
	],
	framework: {
		name: "@storybook/react-webpack5",
		options: {
			builder: {
				fastRefresh: true
			},
		},
	},
	swc: () => ({
		jsc: {
			transform: {
				react: {
					runtime: 'automatic',
				}
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
	staticDirs: [
		{
			from: './public',
			to: '/'
		}
	]
};

export default config;
