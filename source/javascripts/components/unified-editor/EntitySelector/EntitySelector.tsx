import { BitkitSelect, IconPlus, IconSparkleFilled } from '@bitrise/bitkit-v2';
import { useMemo, useState } from 'react';

import useAIButton from '@/hooks/useAIButton';
import { useIsReadOnlyView } from '@/hooks/useTree';

export type EntitySelectorProps = {
  entityIds: string[];
  entityName?: string;
  onChange: (selectedValue: string | undefined) => void;
  onCreate?: () => void;
  secondaryEntities?: {
    label: string;
    ids: string[];
  };
  value?: string;
};

const EntitySelector = (props: EntitySelectorProps) => {
  const { entityIds, entityName, onChange, onCreate, secondaryEntities, value } = props;

  const isReadOnlyView = useIsReadOnlyView();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { isVisible, tooltipLabel, getAIButtonProps } = useAIButton({
    action: 'create_workflow',
    source: 'workflow_selector',
    yamlSelector: entityName === 'Workflow' ? 'workflows' : undefined,
  });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();
  const isAIButtonVisible = isVisible && entityName === 'Workflow';

  const items = useMemo(() => {
    const matches = (id: string) => id.toLowerCase().includes(search.toLowerCase());
    const primary = entityIds.filter(matches).map((id) => ({ label: id, value: id }));
    const secondary = (secondaryEntities?.ids ?? [])
      .filter(matches)
      .map((id) => ({ group: secondaryEntities?.label, label: id, value: id }));

    return [...primary, ...secondary];
  }, [entityIds, search, secondaryEntities]);

  // The search starts over every time the menu opens.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSearch('');
  };

  const handleCreate = () => {
    handleOpenChange(false);
    onCreate?.();
  };

  const handleCreateWithAI = () => {
    handleOpenChange(false);
    onAIButtonClick();
  };

  return (
    <BitkitSelect
      emptyHelperText={search ? 'Modify your search to get results' : undefined}
      emptyLabel={search ? `No ${entityName}s are matching your filter` : `No ${entityName}s yet`}
      flex="1"
      items={items}
      label={entityName}
      labelHidden
      minWidth="0"
      searchPlaceholder="Filter by name..."
      searchValue={search}
      selectProps={{ onOpenChange: ({ open }) => handleOpenChange(open), open: isOpen }}
      size="md"
      value={value ?? ''}
      onSearchChange={setSearch}
      onValueChange={(selectedValue) => onChange(selectedValue || undefined)}
    >
      {/* Read-only views (merged config, cross-repo/ref files) can't create, so they show no actions. */}
      {!isReadOnlyView && !!onCreate && (
        <BitkitSelect.Action icon={IconPlus} label={`Create ${entityName}`} onClick={handleCreate} />
      )}
      {!isReadOnlyView && isAIButtonVisible && (
        <BitkitSelect.Action
          colorVariant="ai"
          icon={IconSparkleFilled}
          label={`Create ${entityName} with AI`}
          state={isAIButtonDisabled ? 'disabled' : undefined}
          tooltip={tooltipLabel}
          onClick={handleCreateWithAI}
        />
      )}
    </BitkitSelect>
  );
};

export default EntitySelector;
