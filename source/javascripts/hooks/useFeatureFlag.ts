import { initialize, LDClient } from 'launchdarkly-js-client-sdk';

import GlobalProps from '@/core/utils/GlobalProps';

const defaultValues = {
  'enable-wfe-bitrise-language-server': false,
  'enable-wfe-step-bundles-when-to-run': false,
};

type FeatureFlags = typeof defaultValues;

let client: LDClient | undefined;

if (GlobalProps.workspaceSlug() && !client) {
  client = initialize(
    window.parent.location.host === 'app.bitrise.io' ? '5e70774c8a726707851d2fff' : '5e70774c8a726707851d2ffe',
    {
      kind: 'user',
      key: `org-${GlobalProps.workspaceSlug()}`,
    },
  );
}

const useFeatureFlag = <K extends keyof FeatureFlags>(key: K): FeatureFlags[K] => {
  const localValue = window.localFeatureFlags?.[key];
  const defaultValue = GlobalProps.accountFeatureFlags()?.[key] ?? defaultValues[key];

  return (localValue ?? client?.variation(key, defaultValue) ?? defaultValue) as FeatureFlags[K];
};

export default useFeatureFlag;
