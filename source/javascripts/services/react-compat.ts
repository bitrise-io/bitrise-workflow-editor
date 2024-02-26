import _ from "underscore";

type AngularScope = {
	$$phase: boolean;
	$digest: VoidFunction;
	$suspend: VoidFunction;
	$evalAsync: (fn: ($scope: AngularScope) => void) => void;
	$applyAsync: (fn: ($scope: AngularScope) => void) => void;
};

type GenFn<T> = (...args: any) => T;

export const safeDigest = (scope: AngularScope): void => {
	if (!scope.$$phase) {
		scope.$digest();
	}
};

export const cachedFn = <T>(fn: GenFn<T>): GenFn<T> => {
	let cached: T;

	return (...args: any): T => {
		const current = fn(...args);

		if (!_.isEqual(current, cached)) {
			cached = current;
		}

		return cached;
	};
};
