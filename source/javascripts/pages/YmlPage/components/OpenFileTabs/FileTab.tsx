import { Tooltip } from '@bitrise/bitkit';
import { BitkitTabs } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import TreeService from '@/core/services/TreeService';
import { useFile, useFileIsDirty } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';
import { useTree } from '@/hooks/useTree';

import DiscardFileTabDialog from './DiscardFileTabDialog';

type Props = {
  nodeId: string;
};

const FileTab = ({ nodeId }: Props) => {
  const { closeTab, discardFile } = useTabs();
  const file = useFile(nodeId);
  const isDirty = useFileIsDirty(nodeId);
  const tree = useTree();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  if (!file) {
    return null;
  }

  const name = TreeService.fileName(file.path);
  // Own ref, or inherited from a cross-ref ancestor (path-only includes carry no source).
  const refLabel = TreeService.effectiveSourceLabel(tree, nodeId);

  // Closing a tab with unsaved edits prompts first; a clean tab closes immediately.
  const handleClose = () => {
    if (isDirty) {
      setIsDiscardOpen(true);
    } else {
      closeTab(nodeId);
    }
  };

  const trigger = (
    <BitkitTabs.Trigger value={nodeId} changed={isDirty} onClose={handleClose}>
      {name}
    </BitkitTabs.Trigger>
  );

  return (
    <>
      {file.editable ? (
        trigger
      ) : (
        <Tooltip label={refLabel ? `Read-only — included from ${refLabel}` : 'Read-only'}>{trigger}</Tooltip>
      )}
      <DiscardFileTabDialog
        isOpen={isDiscardOpen}
        fileName={name}
        onKeepEditing={() => setIsDiscardOpen(false)}
        onDiscard={() => {
          setIsDiscardOpen(false);
          discardFile(nodeId);
        }}
      />
    </>
  );
};

export default FileTab;
