import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dropdown,
  DropdownNoResultsFound,
  DropdownOption,
  DropdownSearch,
  EmptyState,
} from '@bitrise/bitkit';
import { useDebounceValue } from 'usehooks-ts';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useStepBundles } from '@/hooks/useStepBundles';

const StepBundlesSelector = () => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  // TODO: Get the selected stepbundle id
  const [{ id: selectedStepBundleId }, setSelectedWorkflow] = useSelectedWorkflow();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 100);

  const runnableStepBundles = useMemo(() => {
    return stepBundleIds.filter((stepBundleName) =>
      stepBundleName.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch, stepBundleIds]);

  const hasNoSearchResults = debouncedSearch && runnableStepBundles.length === 0;

  const onSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const onCreateWorkflow = () => {
    openDialog({ type: WorkflowsPageDialogType.CREATE_WORKFLOW })();
    dropdownRef.current?.click(); // NOTE: It closes the dropdown...
  };

  return (
    <Dropdown
      flex="1"
      size="md"
      ref={dropdownRef}
      dropdownMaxHeight="359px"
      minWidth="0"
      value={selectedStepBundleId}
      formLabel={selectedStepBundleId ?? 'Select a Step bundle'}
      onChange={({ target: { value } }) => setSelectedWorkflow(value)}
      search={<DropdownSearch placeholder="Filter by name..." value={search} onChange={onSearchChange} />}
    >
      {stepBundleIds.map((id) => (
        <DropdownOption key={id} value={id}>
          {id}
        </DropdownOption>
      ))}

      {hasNoSearchResults && (
        <DropdownNoResultsFound>
          <EmptyState
            iconName="Magnifier"
            backgroundColor="background/primary"
            title="No Step bundles are matching your filter"
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
          leftIconName="PlusCircle"
          justifyContent="flex-start"
          onClick={onCreateWorkflow}
        >
          Create Step bundle
        </Button>
      </Box>
    </Dropdown>
  );
};

export default StepBundlesSelector;
