module.exports = {
	extends: ["prettier"],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
	],
	rules: {
		"@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true }]
	}
};
