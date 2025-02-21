import { initialize, LDClient } from 'launchdarkly-js-client-sdk';
import WindowUtils from '@/core/utils/WindowUtils';

const defaultValues = {
  'enable-wfe-diff-editor': false,
  'enable-wfe-step-bundles-ui': false,
  'enable-wfe-parallel-workflow': false,
};

type FeatureFlags = typeof defaultValues;

let client: LDClient | undefined;

if (WindowUtils.workspaceSlug() && !client) {
  client = initialize(
    window.parent.location.host === 'app.bitrise.io' ? '5e70774c8a726707851d2fff' : '5e70774c8a726707851d2ffe',
    {
      kind: 'user',
      key: `org-${WindowUtils.workspaceSlug()}`,
    },
  );
}

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const localValue = window.localFeatureFlags?.[key];
  const defaultValue = WindowUtils.globalProps()?.featureFlags?.account?.[key] ?? defaultValues[key];

  return (localValue ?? client?.variation(key, defaultValue) ?? defaultValue) as FeatureFlags[K];
};

export default useFeatureFlag;
