import { Box, DialogProps } from '@bitrise/bitkit';
import { rem } from '@bitrise/bitkit-v2';
import { useMemo, useState } from 'react';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import { isFileDirty } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { DiffEditorDialogContent, DiffEditorDialogShell } from './DiffEditorDialog';

const GlobalDiffEditorDialogBody = ({ onClose }: { onClose: VoidFunction }) => {
  const tree = useBitriseYmlStore((s) => s.tree);
  const dirtyFiles = useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((slice) => isFileDirty(slice))
      .map((slice) => ({ nodeId: slice.nodeId, editable: slice.editable })),
  );

  const activeNodeId = useBitriseYmlStore((s) => s.selectedNodeId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    () => dirtyFiles.find((file) => file.nodeId === activeNodeId)?.nodeId ?? dirtyFiles[0]?.nodeId,
  );

  const selected = dirtyFiles.find((file) => file.nodeId === selectedNodeId) ?? dirtyFiles[0];
  const effectiveNodeId = selected?.nodeId;

  const dirtyIds = useMemo(() => new Set(dirtyFiles.map((file) => file.nodeId)), [dirtyFiles]);
  const isDirty = useMemo(() => (node: { nodeId: string }) => dirtyIds.has(node.nodeId), [dirtyIds]);

  return (
    <DiffEditorDialogContent
      onClose={onClose}
      nodeId={effectiveNodeId}
      isReadOnly={!selected?.editable}
      fileSelector={
        <Box
          width={rem(280)}
          flexShrink={0}
          overflowY="auto"
          borderRight="1px solid"
          borderColor="border/minimal"
          pr="8"
        >
          {tree && (
            <FileTreeView
              rootNode={tree}
              filter={isDirty}
              selectedNodeId={effectiveNodeId}
              onSelect={setSelectedNodeId}
            />
          )}
        </Box>
      }
    />
  );
};

const GlobalDiffEditorDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <DiffEditorDialogShell {...rest} onClose={onClose}>
      <GlobalDiffEditorDialogBody onClose={onClose} />
    </DiffEditorDialogShell>
  );
};

export default GlobalDiffEditorDialog;
