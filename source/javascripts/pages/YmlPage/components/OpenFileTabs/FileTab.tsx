import { BitkitTabs, IconLock } from '@bitrise/bitkit-v2';

import TreeService from '@/core/services/TreeService';
import { useFile, useFileIsDirty } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';

type Props = {
  nodeId: string;
};

/**
 * One open-file tab, rendered as a `BitkitTabs.Trigger`. Selection is driven by
 * the enclosing `BitkitTabs.Root` (`onValueChange`); the trigger contributes the
 * unsaved-changes dot (`changed`, which becomes a close button on hover) and the
 * read-only lock icon + source-ref subtext for cross-ref files.
 */
const FileTab = ({ nodeId }: Props) => {
  const { closeTab } = useTabs();
  const file = useFile(nodeId);
  const isDirty = useFileIsDirty(nodeId);

  if (!file) {
    return null;
  }

  const name = TreeService.fileName(file.path);
  const refLabel = TreeService.sourceLabel(file.source);

  return (
    <BitkitTabs.Trigger
      value={nodeId}
      icon={file.editable ? undefined : IconLock}
      secondaryText={refLabel ?? undefined}
      changed={isDirty}
      onClose={() => closeTab(nodeId)}
    >
      {name}
    </BitkitTabs.Trigger>
  );
};

export default FileTab;
