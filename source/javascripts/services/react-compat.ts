type AngularScope = {
  $$phase: boolean;
  $digest: () => void;
};

export const safeDigest = (scope: AngularScope): void => {
  if (!scope.$$phase) {
    scope.$digest();
  }
};
