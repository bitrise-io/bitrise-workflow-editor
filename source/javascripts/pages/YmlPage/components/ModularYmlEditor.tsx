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
import { MERGED_MODEL_URI } from '@/core/utils/lspModelUris';
import YmlUtils from '@/core/utils/YmlUtils';
import { useFile } from '@/hooks/useFile';
import { useNodeModelUri, useSelectedNodeId } from '@/hooks/useTree';

// Read-only tab for the merged config. It's a synthetic flattening, not a source file, so it lives on
// its own `bitrise-merged://` scheme — an isolated single-file language-service workspace (in-file
// navigation/hover) that never joins the real bitrise:// tree. See MERGED_MODEL_URI.
const MERGED_CONFIG_PATH = MERGED_MODEL_URI;

/**
 * Editable source view of a module file. Uncontrolled (Monaco owns the text via
 * `defaultValue`) so partially-typed / transiently-invalid YAML isn't clobbered by a
 * store round-trip; keyed by `node_id` upstream so switching files remounts.
 *
 * `path` is the file's bitrise:// URI, so this binds to the same model the language service analyzes
 * (see `useYmlLanguageServices`); `keepCurrentModel` stops the remount from disposing that shared model.
 */
const EditableFileEditor = ({ file, path }: { file: FileSlice; path: string }) => {
  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      path={path}
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
  const nodeUri = useNodeModelUri(file?.nodeId);
  const mergedYml = useStore(bitriseYmlStore, (s) => s.mergedYml);
  const isMergedStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);

  if (isMerged && isMergedStale && !mergedYml) {
    return <LoadingState />;
  }

  if (!isMerged && file?.editable && nodeUri) {
    return <EditableFileEditor key={file.nodeId} file={file} path={nodeUri} />;
  }

  const value = isMerged ? (mergedYml ?? '') : file ? YmlUtils.toYml(file.ymlDocument) : '';
  // A file with no bitrise:// URI (unmappable path) still gets its own read-only model, never the
  // merged one — so its content can't pollute the merged tab.
  const path = isMerged ? MERGED_CONFIG_PATH : (nodeUri ?? `file:///modular/${file?.nodeId ?? 'unknown.yml'}`);

  return (
    <Box position="relative" height="100%">
      <ReadOnlyViewNotification />
      <Editor
        theme="vs-dark"
        language="yaml"
        keepCurrentModel
        path={path}
        value={value}
        options={{ readOnly: true, minimap: { enabled: false } }}
      />
    </Box>
  );
};

export default ModularYmlEditor;
