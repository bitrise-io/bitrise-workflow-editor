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
 * One open-file tab (`BitkitTabs.Trigger`): unsaved-changes dot, plus a read-only lock
 * icon for cross-ref files with the source ref shown in its tooltip (too long for inline).
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
  // Own ref, or inherited from a cross-ref ancestor (path-only includes carry no source).
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
