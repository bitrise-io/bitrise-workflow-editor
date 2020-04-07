import _ from "underscore";

type AngularScope = {
	$$phase: boolean;
	$digest: () => void;
};

type GenFn<T> = (...args) => T;

export const safeDigest = (scope: AngularScope): void => {
	if (!scope.$$phase) {
		scope.$digest();
	}
};

export const cachedFn = <T>(fn: GenFn<T>): GenFn<T> => {
	let cached: T;

	return (...args): T => {
		const current = fn(...args);

		if (!_.isEqual(current, cached)) {
			cached = current;
		}

		return cached;
	};
};
