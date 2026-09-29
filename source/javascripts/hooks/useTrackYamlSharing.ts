import { datadogRum } from '@datadog/browser-rum';
import { useEffect } from 'react';

import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';
import { configDocuments } from './useVisualEditorBlocker';

/**
 * Keeps whether the config uses YAML aliases or merge keys on every RUM event from here on, so
 * sessions and views can be counted by it. It describes the session, so it's context, not an action.
 */
function useTrackYamlSharing() {
  const { hasAliases, hasMergeKeys } = useBitriseYmlStore((s) => {
    const summaries = configDocuments(s).map(YmlUtils.summarizeYamlSharing);
    return {
      hasAliases: summaries.some((summary) => summary.hasAliases),
      hasMergeKeys: summaries.some((summary) => summary.hasMergeKeys),
    };
  });

  useEffect(() => {
    datadogRum.setGlobalContextProperty('yamlSharing', { hasAliases, hasMergeKeys });
  }, [hasAliases, hasMergeKeys]);
}

export default useTrackYamlSharing;
