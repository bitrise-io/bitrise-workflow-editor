module.exports = {
	parser: "@typescript-eslint/parser",
	root: true,
	env: {
		node: true,
		browser: true,
		jasmine: true,
	},
	plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports", "jasmine", "prettier"],
	globals: {
		_: false,
		cy: false,
		inject: false,
		angular: false,
		Cypress: false,
		Promise: false,
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	extends: [
		"prettier",
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:storybook/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
	],
	rules: {
		"@typescript-eslint/ban-types": ["warn", { types: { "{}": false }, extendDefaults: true }],
		"@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-unused-vars": "off",
		"prefer-const": ["error", { destructuring: "all" }],
		"prettier/prettier": "warn",
		"react/no-unescaped-entities": ["error", { forbid: [">", '"', "}"] }],
		"simple-import-sort/imports": "warn",
		"unused-imports/no-unused-imports": "warn",
		"unused-imports/no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
	},
	overrides: [
		{
			files: ["*.js"],
			rules: {
				"@typescript-eslint/no-var-requires": "off",
				"@typescript-eslint/explicit-function-return-type": "off",
			},
		},
	],
};
