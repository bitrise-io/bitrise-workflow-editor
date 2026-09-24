import { datadogRum } from '@datadog/browser-rum';
import { useEffect } from 'react';

import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

const tracked = new Set<string>();

/** Reports each distinct use of YAML sharing once per page load, so users and sessions can be counted. */
function useTrackYamlSharing() {
  const { ymlDocument, selectedNodeId } = useBitriseYmlStore((s) => ({
    ymlDocument: s.ymlDocument,
    selectedNodeId: s.selectedNodeId,
  }));

  useEffect(() => {
    const { hasAliases, hasMergeKeys, hasAnchors } = YmlUtils.summarizeYamlSharing(ymlDocument);
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
  }, [ymlDocument, selectedNodeId]);
}

export default useTrackYamlSharing;
