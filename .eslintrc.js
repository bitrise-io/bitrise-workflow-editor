module.exports = {
	extends: ["prettier"],
	parser: "@typescript-eslint/parser",
	root: true,
	env: {
		browser: true,
		node: true,
		jasmine: true
	},
	plugins: ["@typescript-eslint", "jasmine"],
	globals: {
		cy: false,
		Cypress: false,
		angular: false,
		_: false,
		inject: false,
		Promise: false
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended"
	],
	rules: {
		"max-len": ["error", { code: 120, tabWidth: 1 }],
		quotes: [2, "double"],
		"no-with": "off",
		"prefer-const": ["error", { destructuring: "all" }],
		"@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true }],
		"@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
		"@typescript-eslint/no-non-null-assertion": "off",
		"react/no-unescaped-entities": ["error", { forbid: [">", '"', "}"] }]
	},
	overrides: [
		{
			files: ["*.js"],
			rules: {
				"@typescript-eslint/explicit-function-return-type": "off"
			}
		},
		{
			files: ["*.config.js"],
			rules: {
				"@typescript-eslint/no-var-requires": "off"
			}
		}
	]
};
