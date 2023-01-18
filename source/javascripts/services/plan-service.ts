const STARTER_PACKAGE = "teams-package";
const STARTER_PACKAGE_TRIAL = "starter-package-trial";

const MODERN_CONCURRENCY_PLANS = [STARTER_PACKAGE, STARTER_PACKAGE_TRIAL];

export const isModernConcurrencyPlan = (name: string): boolean => {
	return MODERN_CONCURRENCY_PLANS.includes(name);
};
