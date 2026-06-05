import { useDisclosure } from '@bitrise/bitkit';
import { BitkitIconButton, IconArrowsHorizontal } from '@bitrise/bitkit-v2';

import DiffEditorDialog from '@/components/DiffEditor/DiffEditorDialog';
import MergedDiffDialog from '@/components/DiffEditor/MergedDiffDialog';
import { MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useFileIsDirty } from '@/hooks/useFile';
import { useSelectedNodeId } from '@/hooks/useTree';

/**
 * Per-tab "Show diff" button in the editor tab strip.
 *
 *   - On a file tab: enabled when that tab is dirty; opens the active-document
 *     diff (editable, saved → current, with Apply).
 *   - On the Merged Config tab: enabled when unsaved edits changed the merged
 *     result; opens a read-only diff of the saved vs. current merged config.
 */
const TabDiffButton = () => {
  const selectedNodeId = useSelectedNodeId();
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  const isFileDirty = useFileIsDirty(selectedNodeId ?? '');
  const isMergedDirty = useBitriseYmlStore(
    (s) => s.savedMergedYml !== undefined && s.mergedYml !== undefined && s.savedMergedYml !== s.mergedYml,
  );
  const isDirty = isMerged ? isMergedDirty : isFileDirty;

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <BitkitIconButton
        label="Show diff for this file"
        variant="secondary"
        size="sm"
        icon={IconArrowsHorizontal}
        state={isDirty ? undefined : 'disabled'}
        onClick={onOpen}
      />
      {isMerged ? (
        <MergedDiffDialog isOpen={isOpen} onClose={onClose} />
      ) : (
        <DiffEditorDialog isOpen={isOpen} onClose={onClose} />
      )}
    </>
  );
};

export default TabDiffButton;
