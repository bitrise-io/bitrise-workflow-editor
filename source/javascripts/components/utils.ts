
type AngularScope = {
    $$phase: boolean,
    $digest: () => void
};

export const safeDigest = (scope: AngularScope) => {
    if (!scope.$$phase) {
        scope.$digest();
    }
};
