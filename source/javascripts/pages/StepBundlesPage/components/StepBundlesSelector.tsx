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
import { useStepBundles } from '@/hooks/useStepBundles';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';

const StepBundlesSelector = () => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const stepBundleId = useStepBundlesPageStore((s) => s.stepBundleId) || stepBundleIds[0];
  const setStepBundleId = useStepBundlesPageStore((s) => s.setStepBundleId);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 100);

  const filteredStepBundles = useMemo(() => {
    return stepBundleIds.filter((stepBundleName) =>
      stepBundleName.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch, stepBundleIds]);

  const hasNoSearchResults = debouncedSearch && filteredStepBundles.length === 0;

  const onSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const onCreateStepBundle = () => {
    openDialog({ type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE })();
    dropdownRef.current?.click(); // NOTE: It closes the dropdown...
  };

  return (
    <Dropdown
      flex="1"
      size="md"
      ref={dropdownRef}
      dropdownMaxHeight="359px"
      minWidth="0"
      value={stepBundleId}
      formLabel={stepBundleId ?? 'Select a Step bundle'}
      onChange={({ target: { value } }) => {
        setStepBundleId(value || '');
      }}
      search={<DropdownSearch placeholder="Filter by name..." value={search} onChange={onSearchChange} />}
    >
      {filteredStepBundles.map((id) => (
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
          onClick={onCreateStepBundle}
        >
          Create Step bundle
        </Button>
      </Box>
    </Dropdown>
  );
};

export default StepBundlesSelector;
