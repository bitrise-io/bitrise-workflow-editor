type FeatureFlags = {
  'enable-wfe-pipeline-viewer': boolean;
};

const defaultValues: FeatureFlags = {
  'enable-wfe-pipeline-viewer': false,
};

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  return (window.parent?.globalProps?.featureFlags?.user?.[key] ??
    window.parent?.globalProps?.featureFlags?.account?.[key] ??
    defaultValues[key]) as FeatureFlags[K];
};

export default useFeatureFlag;
