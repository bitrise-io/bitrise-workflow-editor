import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import TreeService from '@/core/services/TreeService';
import { isFileDirty, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedConfigSync from '@/hooks/useMergedConfigSync';
import useMountedWhileOpen from '@/hooks/useMountedWhileOpen';

import { DiffEditorDialogContent, DiffEditorDialogProps } from './DiffEditorDialog';

const GlobalDiffEditorDialogBody = ({
  isOpen,
  onClose,
  onExitComplete,
}: DiffEditorDialogProps & { onExitComplete: VoidFunction }) => {
  const dirtyFiles = useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((slice) => isFileDirty(slice))
      .map((slice) => ({
        nodeId: slice.nodeId,
        name: TreeService.fileName(slice.path),
        editable: slice.editable,
      })),
  );

  const activeNodeId = useBitriseYmlStore((s) => s.selectedNodeId);
  // Default to the active file's tab when it has changes, otherwise the merged overview.
  const [selectedTab, setSelectedTab] = useState<string>(
    () => dirtyFiles.find((file) => file.nodeId === activeNodeId)?.nodeId ?? MERGED_CONFIG_NODE_ID,
  );

  const selectedFile = dirtyFiles.find((file) => file.nodeId === selectedTab);
  // If the selected file tab vanished (saved/discarded elsewhere), fall back to the merged tab.
  const effectiveTab = selectedTab === MERGED_CONFIG_NODE_ID || selectedFile ? selectedTab : MERGED_CONFIG_NODE_ID;
  const isMerged = effectiveTab === MERGED_CONFIG_NODE_ID;

  // The merge is a backend round-trip; trigger it (like the main Merged tab does) so the dialog's
  // Merged tab shows the live merged config even before saving.
  useMergedConfigSync({ active: isMerged });

  return (
    <DiffEditorDialogContent
      isOpen={isOpen}
      onClose={onClose}
      onExitComplete={onExitComplete}
      nodeId={effectiveTab}
      isReadOnly={isMerged || !selectedFile?.editable}
      tabs={
        <BitkitTabs.Root value={effectiveTab} onValueChange={({ value }) => setSelectedTab(value)}>
          <BitkitTabs.List>
            <BitkitTabs.Trigger value={MERGED_CONFIG_NODE_ID} icon={IconGroup}>
              Merged config
            </BitkitTabs.Trigger>
            {dirtyFiles.map((file) => (
              <BitkitTabs.Trigger key={file.nodeId} value={file.nodeId}>
                {file.name}
              </BitkitTabs.Trigger>
            ))}
          </BitkitTabs.List>
        </BitkitTabs.Root>
      }
    />
  );
};

const GlobalDiffEditorDialog = ({ isOpen, onClose }: DiffEditorDialogProps) => {
  const { isMounted, onExitComplete } = useMountedWhileOpen(isOpen);

  if (!isMounted) {
    return null;
  }

  return <GlobalDiffEditorDialogBody isOpen={isOpen} onClose={onClose} onExitComplete={onExitComplete} />;
};

export default GlobalDiffEditorDialog;
