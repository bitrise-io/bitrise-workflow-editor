import { useEffect, useMemo, useState } from 'react';
import { Box, Icon, IconButton, Input, Popover, PopoverContent, PopoverTrigger, Text } from '@bitrise/bitkit';

import { Workflow } from '../../models';
import WorkflowSelectorItem from './WorkflowSelectorItem/WorkflowSelectorItem';

const popoverOffset: [number, number] = [-8, 8];

export type WorkflowSelectorProps = {
  selectedWorkflow: Workflow;
  workflows: Workflow[];
  selectWorkflow: (workflow: Workflow) => void;
  renameWorkflowConfirmed: (workflow: Workflow, newWorkflowID: string) => void;
};

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  selectedWorkflow,
  workflows,
  selectWorkflow,
  renameWorkflowConfirmed,
}: WorkflowSelectorProps) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const onItemClick = (workflow: Workflow): void => {
    selectWorkflow(workflow);
    setVisible(false);
    setSearch('');
  };

  const onEscPress = ({ key }: KeyboardEvent): void => {
    if (key === 'Escape') {
      setVisible(false);
      setSearch('');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onEscPress, false);
    return () => {
      document.removeEventListener('keydown', onEscPress, false);
    };
  }, []);

  const filteredWorkflows = useMemo(() => {
    let result = [...workflows];
    if (search) {
      const regExp = new RegExp(search, 'i');
      result = workflows.filter((workflow) => regExp.test(workflow.id));
    }

    return result;
  }, [workflows, search]);

  const workflowIds = useMemo(() => {
    return workflows.map((workflow) => workflow.id);
  }, [workflows]);

  const onClearSearch = (): void => {
    setTimeout(() => setSearch(''), 0);
  };

  return (
    <Popover
      offset={popoverOffset}
      placement="bottom-start"
      lazyBehavior="unmount"
      isLazy
      isOpen={visible}
      onOpen={() => setVisible(true)}
      onClose={() => setVisible(false)}
    >
      <PopoverTrigger>
        <Box
          display="flex"
          height="47px"
          borderRadius="4"
          border="1px solid"
          borderColor="neutral.90"
          overflow="hidden"
          data-e2e-tag="workflow-selector"
          flexShrink={1}
        >
          <Box
            display="flex"
            backgroundColor="neutral.50"
            color="neutral.100"
            padding="16"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="2" textTransform="uppercase">
              Workflow
            </Text>
          </Box>
          <Box
            as="button"
            display="flex"
            padding="12"
            flexGrow={1}
            cursor="pointer"
            alignItems="center"
            justifyContent="center"
            onClick={() => setVisible(true)}
            data-e2e-tag="workflow-selector-dropdown"
            _hover={{
              background: 'neutral.93',
            }}
          >
            <Text
              textColor="purple.10"
              hasEllipsis
              textAlign="left"
              data-e2e-tag="workflow-selector-selected-workflow-name"
            >
              {selectedWorkflow.id}
            </Text>
            <Icon size="24" name="ChevronDown" />
          </Box>
        </Box>
      </PopoverTrigger>

      <PopoverContent width="560px">
        <Input
          padding="12"
          leftIconName="Magnifier"
          autoFocus
          placeholder="Search workflows..."
          value={search}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setSearch(ev.target.value)}
          rightAddon={
            search ? (
              <IconButton
                aria-label="Reset"
                iconName="CloseSmall"
                onClick={onClearSearch}
                variant="tertiary"
                _active={{ background: 'transparent' }}
                _hover={{ background: 'transparent' }}
              />
            ) : null
          }
          rightAddonPlacement="inside"
        />
        {filteredWorkflows.length ? (
          <Box maxHeight="360px" overflow="scroll" data-e2e-tag="workflow-selector-list">
            {filteredWorkflows.map((workflow) => (
              <WorkflowSelectorItem
                key={workflow.id}
                workflow={workflow}
                selectWorkflow={onItemClick}
                selectedWorkflowId={selectedWorkflow.id}
                workflowIds={workflowIds}
                renameWorkflowConfirmed={renameWorkflowConfirmed}
                data-e2e-tag="workflow-selector-option"
              />
            ))}
          </Box>
        ) : (
          <Box
            display="flex"
            textColor="neutral.50"
            gap="12"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="20"
          >
            <Icon name="BitbotError" width="40px" height="40px" />
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="4">
              <Text fontWeight="bold">No workflows found.</Text>
              <Text>Modify or reset the search.</Text>
            </Box>
          </Box>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WorkflowSelector;
