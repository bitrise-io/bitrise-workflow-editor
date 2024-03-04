module.exports = {
	parser: "@typescript-eslint/parser",
	root: true,
	env: {
		browser: true,
		node: true,
		jasmine: true,
	},
	plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports", "jasmine", "prettier"],
	globals: {
		cy: false,
		Cypress: false,
		angular: false,
		_: false,
		inject: false,
		Promise: false,
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:prettier/recommended",
	],
	rules: {
		"no-with": "off",
		"prettier/prettier": "warn",
		"simple-import-sort/imports": "warn",
		"unused-imports/no-unused-imports": "warn",
		"prefer-const": ["error", { destructuring: "all" }],
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
		"react/no-unescaped-entities": ["error", { forbid: [">", '"', "}"] }],
		"@typescript-eslint/ban-types": [
			"warn",
			{
				types: {
					"{}": false,
				},
				extendDefaults: true,
			},
		],
		"unused-imports/no-unused-vars": [
			"warn",
			{
				varsIgnorePattern: "^_",
				argsIgnorePattern: "^_",
			},
		],
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
