const defaultValues = {
  'enable-wfe-pipeline-viewer': false,
};

type FeatureFlags = typeof defaultValues;

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  return (window.parent?.globalProps?.featureFlags?.user?.[key] ??
    window.parent?.globalProps?.featureFlags?.account?.[key] ??
    defaultValues[key]) as FeatureFlags[K];
};

export default useFeatureFlag;
