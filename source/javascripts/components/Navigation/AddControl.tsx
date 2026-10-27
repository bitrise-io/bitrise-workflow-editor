import {
  BitkitActionMenu,
  BitkitButton,
  BitkitControlButton,
  IconFileYml,
  IconPlus,
  IconSparkleFilled,
} from '@bitrise/bitkit-v2';
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
  // `control`: the section header's +. `button`: a labelled button, for an empty list's empty state.
  variant?: 'control' | 'button';
};

const editableFiles = (node: TreeNode): TreeNode[] => [
  ...(node.editable ? [node] : []),
  ...node.includes.flatMap(editableFiles),
];

const AddControl = ({ entityName, onCreate, ai, variant = 'control' }: Props) => {
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
  const trigger = ({ isDisabled, onClick }: { isDisabled?: boolean; onClick?: () => void } = {}) =>
    variant === 'button' ? (
      <BitkitButton
        size="md"
        variant="secondary"
        alignSelf="stretch"
        icon={IconPlus}
        state={isDisabled ? 'disabled' : undefined}
        onClick={onClick}
      >
        {label}
      </BitkitButton>
    ) : (
      <BitkitControlButton
        icon={IconPlus}
        label={isDisabled ? `${label} (read-only view)` : label}
        size="sm"
        // Bitkit hides the tooltip on a control that opens a menu; every control button here names itself.
        tooltipProps={{ disabled: false }}
        state={isDisabled ? 'disabled' : undefined}
        onClick={onClick}
      />
    );

  // The merged view and other repositories' files are read-only, so a new entity needs a file to
  // live in: ask for one, open it, then create there.
  if (isReadOnlyView && files.length > 0) {
    return (
      <BitkitActionMenu data-clarity-mask="true" size="md" trigger={trigger()}>
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
    return trigger({ isDisabled: true });
  }

  if (ai && isAIVisible) {
    return (
      <BitkitActionMenu size="md" trigger={trigger()}>
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

  return trigger({ onClick: onCreate });
};

export default AddControl;
