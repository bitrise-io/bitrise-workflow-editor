import { BitkitPopover } from '@bitrise/bitkit-v2';

import { useFileTabs } from '@/hooks/useFileTabs';
import { useSelectedNodeId, useTree } from '@/hooks/useTree';

import FileTreeView from './FileTreeView';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Anchor for the popover — the tab strip's add button, which can't be a popover trigger. */
  getAnchor: () => HTMLElement | null;
};

const FileTreeViewer = ({ open, onOpenChange, getAnchor }: Props) => {
  const tree = useTree();
  const selectedNodeId = useSelectedNodeId();
  const { openFile } = useFileTabs();

  if (!tree) {
    return null;
  }

  return (
    <BitkitPopover
      title="Open module"
      open={open}
      onOpenChange={onOpenChange}
      positioning={{ getAnchorElement: getAnchor }}
      // The add button is the anchor, not a trigger, so keep clicks on it from counting as an
      // outside-dismiss — otherwise it would fight the button's own open/close toggle.
      persistentElements={[getAnchor]}
    >
      <FileTreeView
        rootNode={tree}
        selectedNodeId={selectedNodeId}
        onSelect={(nodeId) => {
          openFile(nodeId);
          onOpenChange(false);
        }}
      />
    </BitkitPopover>
  );
};

export default FileTreeViewer;
