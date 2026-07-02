import GlobalProps from '@/core/utils/GlobalProps';

const defaultValues = {
  'enable-ci-config-expert-agent': false,
  'enable-branch-switching': false,
  'enable-wfe-tool-versions': false,
  'enable-wfe-modular-yaml-editing': false,
};

type FeatureFlags = typeof defaultValues;

// Feature flags are resolved by the parent (monolith) and injected into the parent window's
// `globalProps.featureFlags.account` (read via WindowUtils.instance() === window.parent); a
// local `ld.local.json` override wins in development.
const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const localValue = window.localFeatureFlags?.[key];

  return (localValue ?? GlobalProps.accountFeatureFlags()?.[key] ?? defaultValues[key]) as FeatureFlags[K];
};

export default useFeatureFlag;
