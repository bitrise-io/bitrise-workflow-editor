import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dropdown,
  DropdownGroup,
  DropdownNoResultsFound,
  DropdownOption,
  DropdownSearch,
  EmptyState,
} from '@bitrise/bitkit';
import { useDebounceValue } from 'usehooks-ts';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';

const WorkflowSelector = () => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const { openCreateWorkflowDialog } = useWorkflowsPageStore();
  const [{ id: selectedWorkflowId }, setSelectedWorkflow] = useSelectedWorkflow();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 100);

  const [utilityWorkflows, runnableWorkflows] = useMemo(() => {
    const utility: string[] = [];
    const runnable: string[] = [];

    workflowIds.forEach((workflowName) => {
      if (workflowName.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        if (workflowName.startsWith('_')) {
          utility.push(workflowName);
        } else {
          runnable.push(workflowName);
        }
      }
    });

    return [utility, runnable];
  }, [debouncedSearch, workflowIds]);

  const hasUtilityWorkflows = utilityWorkflows.length > 0;
  const hasNoSearchResults = debouncedSearch && utilityWorkflows.length === 0 && runnableWorkflows.length === 0;

  const onSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const onCreateWorkflow = () => {
    openCreateWorkflowDialog();
    dropdownRef.current?.click(); // NOTE: It closes the dropdown...
  };

  return (
    <Dropdown
      flex="1"
      size="md"
      ref={dropdownRef}
      dropdownMaxHeight="359px"
      minWidth="0"
      formLabel={selectedWorkflowId ?? 'Select a Workflow'}
      value={selectedWorkflowId}
      onChange={({ target: { value } }) => setSelectedWorkflow(value)}
      search={<DropdownSearch placeholder="Filter by name..." value={search} onChange={onSearchChange} />}
    >
      {runnableWorkflows.map((id) => (
        <DropdownOption key={id} value={id}>
          {id}
        </DropdownOption>
      ))}

      {hasUtilityWorkflows && (
        <DropdownGroup label="utility workflows" labelProps={{ whiteSpace: 'nowrap' }}>
          {utilityWorkflows.map((id) => (
            <DropdownOption key={id} value={id}>
              {id}
            </DropdownOption>
          ))}
        </DropdownGroup>
      )}

      {hasNoSearchResults && (
        <DropdownNoResultsFound>
          <EmptyState
            iconName="Magnifier"
            backgroundColor="background/primary"
            title="No Workflows are matching your filter"
            description="Modify your search to get results"
          />
        </DropdownNoResultsFound>
      )}

      <Box
        w="100%"
        mt="8"
        py="12"
        mb="-12"
        bottom="-12"
        position="sticky"
        borderTop="1px solid"
        borderColor="border/regular"
        backgroundColor="background/primary"
      >
        <Button
          w="100%"
          border="none"
          fontWeight="400"
          borderRadius="0"
          variant="secondary"
          leftIconName="PlusAdd"
          justifyContent="flex-start"
          onClick={onCreateWorkflow}
        >
          Create Workflow
        </Button>
      </Box>
    </Dropdown>
  );
};

export default WorkflowSelector;
