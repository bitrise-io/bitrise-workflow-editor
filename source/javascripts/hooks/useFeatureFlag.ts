const defaultValues = {
  'enable-wfe-pipeline-viewer': false,
};

type FeatureFlags = typeof defaultValues;

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const accountValue = window.parent?.globalProps?.featureFlags?.account?.[key];
  const defaultValue = defaultValues[key];

  return (accountValue ?? defaultValue) as FeatureFlags[K];
};

export default useFeatureFlag;
