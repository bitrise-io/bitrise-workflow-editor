const STARTER_PACKAGE = "teams-package";
const STARTER_PACKAGE_TRIAL = "starter-package-trial";
const DEPRECATED_PLANS = [
	"deprecated-concrete-developer",
	"deprecated-concrete-pro",
	"deprecated-organization-elite",
	"deprecated-enterprise-elite"
];

const MODERN_CONCURRENCY_PLANS = [STARTER_PACKAGE, STARTER_PACKAGE_TRIAL, ...DEPRECATED_PLANS];

export const isModernConcurrencyPlan = (name: string): boolean => {
	return MODERN_CONCURRENCY_PLANS.includes(name);
};
