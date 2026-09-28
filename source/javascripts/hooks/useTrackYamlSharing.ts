import { datadogRum } from '@datadog/browser-rum';
import { useEffect } from 'react';

import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';
import { useSelectedNodeId } from './useTree';

const tracked = new Set<string>();

/** Reports YAML sharing once per file per page load, so users and sessions can be counted. */
function useTrackYamlSharing() {
  // The cached summary, not the document: `useShallow` would deep-compare a whole `Document`.
  const { hasAliases, hasMergeKeys } = useBitriseYmlStore((s) => YmlUtils.summarizeYamlSharing(s.ymlDocument));
  const selectedNodeId = useSelectedNodeId();

  useEffect(() => {
    if (!hasAliases && !hasMergeKeys) {
      return;
    }

    // The first sighting per file only: later edits to the same file would inflate the counts.
    const key = selectedNodeId ?? '';
    if (tracked.has(key)) {
      return;
    }
    tracked.add(key);

    datadogRum.addAction('wfe_yaml_sharing_detected', {
      hasAliases,
      hasMergeKeys,
    });
  }, [hasAliases, hasMergeKeys, selectedNodeId]);
}

export default useTrackYamlSharing;
