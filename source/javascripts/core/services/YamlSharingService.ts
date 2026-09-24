import {
  bitriseYmlStore,
  forceRefreshStates,
  getYmlString,
  updateBitriseYmlDocument,
} from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function previewExpansion() {
  const { ymlDocument } = bitriseYmlStore.getState();
  return {
    currentText: getYmlString(),
    expandedText: YmlUtils.toYml(YmlUtils.expandYamlSharing(ymlDocument.clone())),
  };
}

/** Expands the active document as an unsaved edit, and returns what it removed. */
function expand() {
  const removed = YmlUtils.summarizeYamlSharing(bitriseYmlStore.getState().ymlDocument);
  updateBitriseYmlDocument(({ doc }) => YmlUtils.expandYamlSharing(doc));
  forceRefreshStates();
  return removed;
}

export default { previewExpansion, expand };
