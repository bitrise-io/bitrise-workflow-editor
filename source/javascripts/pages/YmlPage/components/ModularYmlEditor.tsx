import { Box } from '@bitrise/bitkit';
import Editor from '@monaco-editor/react';
import { useStore } from 'zustand';

import LoadingState from '@/components/LoadingState';
import ReadOnlyViewNotification from '@/components/ReadOnlyViewNotification';
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
 * Editable source view of a module file. Uncontrolled (Monaco owns the text via
 * `defaultValue`) so partially-typed / transiently-invalid YAML isn't clobbered by a
 * store round-trip; keyed by `node_id` upstream so switching files remounts.
 */
const EditableFileEditor = ({ file }: { file: FileSlice }) => {
  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      path={`file:///modular/${file.nodeId}`}
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
 * Source view of the active tab: editable for module files, read-only for the merged
 * config and cross-ref files. The merged config is kept fresh by `useMergedConfigSync`.
 */
const ModularYmlEditor = () => {
  const selectedNodeId = useSelectedNodeId();
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  const file = useFile(isMerged ? '' : (selectedNodeId ?? ''));
  const mergedYml = useStore(bitriseYmlStore, (s) => s.mergedYml);
  const isMergedStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);

  if (isMerged && isMergedStale && !mergedYml) {
    return <LoadingState />;
  }

  if (!isMerged && file?.editable) {
    return <EditableFileEditor key={file.nodeId} file={file} />;
  }

  const value = isMerged ? (mergedYml ?? '') : file ? YmlUtils.toYml(file.ymlDocument) : '';
  const path = isMerged ? 'file:///merged_config.yml' : `file:///modular/${file?.nodeId ?? 'unknown.yml'}`;

  return (
    <Box position="relative" height="100%">
      <ReadOnlyViewNotification />
      <Editor
        theme="vs-dark"
        language="yaml"
        path={path}
        value={value}
        options={{ readOnly: true, minimap: { enabled: false } }}
      />
    </Box>
  );
};

export default ModularYmlEditor;
