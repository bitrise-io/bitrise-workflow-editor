import _ from "underscore";

type AngularScope = {
    $$phase: boolean,
    $digest: () => void
};

export const safeDigest = (scope: AngularScope) => {
    if (!scope.$$phase) {
        scope.$digest();
    }
};

export const cachedFn = <T>(fn: (...args: any) => T) => {
    let cached: T;

    return (...args: any): T => {
        const current = fn(...args);

        if (!_.isEqual(current, cached)) {
            cached = current;
        }

        return cached;
    }
};
