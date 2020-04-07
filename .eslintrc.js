module.exports = {
	extends: ["prettier"],
	parser: "@typescript-eslint/parser",
	root: true,
	env: {
		browser: true,
		node: true
	},
  plugins: [
    "@typescript-eslint",
	],
	globals: {
		cy: false,
		Cypress: false,
		angular: false,
		_: false,
	},
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
	],
	rules: {
		"quotes": [2, "double"],
		"@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true }],
		"@typescript-eslint/no-explicit-any": ["warn", { fixToUnknown: true, ignoreRestArgs: true }],
		"@typescript-eslint/no-non-null-assertion": "off"
	}
};
