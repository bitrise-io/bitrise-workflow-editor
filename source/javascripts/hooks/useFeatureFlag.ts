const defaultValues = {
  'enable-wfe-step-bundles-ui': false,
  'enable-wfe-parallel-workflow': false,
  'enable-wfe-config-conflict-resolution-ui': false,
  'enable-wfe-x-bitrise-config-version-header': false,
};

type FeatureFlags = typeof defaultValues;

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const localValue = window.localFeatureFlags?.[key];
  const accountValue = window.parent?.globalProps?.featureFlags?.account?.[key];
  const defaultValue = defaultValues[key];

  return (localValue ?? accountValue ?? defaultValue) as FeatureFlags[K];
};

export default useFeatureFlag;
