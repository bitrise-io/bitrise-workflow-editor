import { datadogRum } from '@datadog/browser-rum';
import { useEffect } from 'react';

import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';
import { useSelectedNodeId } from './useTree';

const tracked = new Set<string>();

/** Reports each distinct use of YAML sharing once per page load, so users and sessions can be counted. */
function useTrackYamlSharing() {
  // The cached summary, not the document: `useShallow` would deep-compare a whole `Document`.
  const { hasAliases, hasMergeKeys, hasAnchors } = useBitriseYmlStore((s) =>
    YmlUtils.summarizeYamlSharing(s.ymlDocument),
  );
  const selectedNodeId = useSelectedNodeId();

  useEffect(() => {
    if (!hasAliases && !hasMergeKeys && !hasAnchors) {
      return;
    }

    const key = [selectedNodeId, hasAliases, hasMergeKeys, hasAnchors].join(':');
    if (tracked.has(key)) {
      return;
    }
    tracked.add(key);

    datadogRum.addAction('wfe_yaml_sharing_detected', {
      hasAliases,
      hasMergeKeys,
      hasAnchors,
      visualEditorDisabled: hasAliases || hasMergeKeys,
    });
  }, [hasAliases, hasMergeKeys, hasAnchors, selectedNodeId]);
}

export default useTrackYamlSharing;
