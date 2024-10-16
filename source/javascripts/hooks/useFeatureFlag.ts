const defaultValues = {
  'enable-wfe-pipeline-viewer': false,
  'enable-target-based-triggers': false,
};

type FeatureFlags = typeof defaultValues;

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const localValue = window.localFeatureFlags?.[key];
  const accountValue = window.parent?.globalProps?.featureFlags?.account?.[key];
  const defaultValue = defaultValues[key];

  return (localValue ?? accountValue ?? defaultValue) as FeatureFlags[K];
};

export default useFeatureFlag;
