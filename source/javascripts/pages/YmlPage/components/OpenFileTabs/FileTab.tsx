import { Tooltip } from '@bitrise/bitkit';
import { BitkitTabs, IconLock } from '@bitrise/bitkit-v2';

import TreeService from '@/core/services/TreeService';
import { useFile, useFileIsDirty } from '@/hooks/useFile';
import { useTabs } from '@/hooks/useTabs';
import { useTree } from '@/hooks/useTree';

type Props = {
  nodeId: string;
};

/**
 * One open-file tab, rendered as a `BitkitTabs.Trigger`. Selection is driven by
 * the enclosing `BitkitTabs.Root` (`onValueChange`); the trigger contributes the
 * unsaved-changes dot (`changed`, which becomes a close button on hover) and a
 * read-only lock icon for cross-ref files. The source ref (e.g. branch/tag) is
 * shown in the lock's tooltip rather than inline — the badge text is too long to
 * sit in the tab without making it unwieldy.
 */
const FileTab = ({ nodeId }: Props) => {
  const { closeTab } = useTabs();
  const file = useFile(nodeId);
  const isDirty = useFileIsDirty(nodeId);
  const tree = useTree();

  if (!file) {
    return null;
  }

  const name = TreeService.fileName(file.path);
  // Effective source: own ref, or inherited from a cross-ref ancestor (a
  // path-only include is read-only but carries no source of its own).
  const refLabel = TreeService.effectiveSourceLabel(tree, nodeId);

  const trigger = (
    <BitkitTabs.Trigger
      value={nodeId}
      icon={file.editable ? undefined : IconLock}
      changed={isDirty}
      onClose={() => closeTab(nodeId)}
    >
      {name}
    </BitkitTabs.Trigger>
  );

  if (!file.editable) {
    return <Tooltip label={refLabel ? `Read-only — included from ${refLabel}` : 'Read-only'}>{trigger}</Tooltip>;
  }

  return trigger;
};

export default FileTab;
