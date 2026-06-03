import Editor from '@monaco-editor/react';
import { useStore } from 'zustand';

import LoadingState from '@/components/LoadingState';
import {
  bitriseYmlStore,
  FileSlice,
  MERGED_CONFIG_NODE_ID,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import { useFile } from '@/hooks/useFile';
import { useSelectedNodeId } from '@/hooks/useTree';

/**
 * Editable source view of an editable module file. Uncontrolled (Monaco owns the
 * text via `defaultValue`); edits are routed into the active file's slice by
 * `updateBitriseYmlDocumentByString`. Keyed by `node_id` upstream so switching
 * to a different file remounts with that file's content; within a file the
 * editor keeps its own buffer, so partially-typed / transiently-invalid YAML
 * isn't clobbered by a store round-trip.
 */
const EditableFileEditor = ({ file }: { file: FileSlice }) => {
  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      path={`file:///modular/${file.path}`}
      defaultValue={YmlUtils.toYml(file.ymlDocument)}
      onChange={(value) => {
        if (typeof value === 'string') {
          updateBitriseYmlDocumentByString(value);
        }
      }}
      options={{ minimap: { enabled: false } }}
    />
  );
};

/**
 * Source view of the active tab. An editable module file is editable; the merged
 * config and read-only (cross-ref) files render read-only. The merged config is
 * fetched + kept fresh globally by `useMergedConfigSync` (mounted in MainLayout);
 * this view just renders it.
 */
const ModularYmlEditor = () => {
  const selectedNodeId = useSelectedNodeId();
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  const file = useFile(isMerged ? '' : (selectedNodeId ?? ''));
  const mergedYml = useStore(bitriseYmlStore, (s) => s.mergedYml);
  const isMergedStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);

  // While the merged view is selected but still stale with nothing to show yet.
  if (isMerged && isMergedStale && !mergedYml) {
    return <LoadingState />;
  }

  if (!isMerged && file?.editable) {
    return <EditableFileEditor key={file.nodeId} file={file} />;
  }

  // Read-only: the merged config, or a cross-ref (non-editable) file.
  const value = isMerged ? (mergedYml ?? '') : file ? YmlUtils.toYml(file.ymlDocument) : '';
  const path = isMerged ? 'file:///merged_config.yml' : `file:///modular/${file?.path ?? 'unknown.yml'}`;

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      path={path}
      value={value}
      options={{ readOnly: true, minimap: { enabled: false } }}
    />
  );
};

export default ModularYmlEditor;
