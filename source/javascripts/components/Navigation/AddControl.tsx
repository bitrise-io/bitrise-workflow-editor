import { BitkitActionMenu, BitkitControlButton, IconFileYml, IconPlus, IconSparkleFilled } from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import { TreeNode } from '@/core/models/Tree';
import useAIButton from '@/hooks/useAIButton';
import { useFileTabs } from '@/hooks/useFileTabs';
import { useIsReadOnlyView, useTree } from '@/hooks/useTree';

type Props = {
  entityName: 'Workflow' | 'Pipeline' | 'Step bundle';
  // Opens the entity's page and its create dialog; false when navigation is blocked.
  onCreate: () => void;
  // The AI-create entry the old dropdowns had (Workflows and Pipelines only).
  ai?: { action: string; source: string; yamlSelector: string };
};

const editableFiles = (node: TreeNode): TreeNode[] => [
  ...(node.editable ? [node] : []),
  ...node.includes.flatMap(editableFiles),
];

const AddControl = ({ entityName, onCreate, ai }: Props) => {
  const tree = useTree();
  const isReadOnlyView = useIsReadOnlyView();
  const { openFile } = useFileTabs();
  const files = useMemo(() => (tree ? editableFiles(tree) : []), [tree]);
  const {
    isVisible: isAIVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({
    action: ai?.action ?? '',
    source: ai?.source,
    yamlSelector: ai?.yamlSelector,
  });
  const { isDisabled: isAIDisabled, onClick: onCreateWithAI } = getAIButtonProps();
  const label = `Create ${entityName}`;

  // The merged view and other repositories' files are read-only, so a new entity needs a file to
  // live in: ask for one, open it, then create there.
  if (isReadOnlyView && files.length > 0) {
    return (
      <BitkitActionMenu
        data-clarity-mask="true"
        size="md"
        trigger={<BitkitControlButton icon={IconPlus} label={label} size="sm" />}
      >
        <BitkitActionMenu.Group label={`Add a ${entityName} to…`}>
          {files.map((file) => (
            <BitkitActionMenu.Item
              key={file.nodeId}
              icon={IconFileYml}
              onClick={() => {
                openFile(file.nodeId);
                onCreate();
              }}
            >
              {file.path}
            </BitkitActionMenu.Item>
          ))}
        </BitkitActionMenu.Group>
      </BitkitActionMenu>
    );
  }

  if (isReadOnlyView) {
    return <BitkitControlButton icon={IconPlus} label={`${label} (read-only view)`} size="sm" state="disabled" />;
  }

  if (ai && isAIVisible) {
    return (
      <BitkitActionMenu size="md" trigger={<BitkitControlButton icon={IconPlus} label={label} size="sm" />}>
        <BitkitActionMenu.Item icon={IconPlus} onClick={onCreate}>
          {label}
        </BitkitActionMenu.Item>
        <BitkitActionMenu.Item
          icon={IconSparkleFilled}
          disabled={isAIDisabled}
          secondaryText={isAIDisabled ? tooltipLabel : undefined}
          onClick={onCreateWithAI}
        >
          {`${label} with AI`}
        </BitkitActionMenu.Item>
      </BitkitActionMenu>
    );
  }

  return <BitkitControlButton icon={IconPlus} label={label} size="sm" onClick={onCreate} />;
};

export default AddControl;
