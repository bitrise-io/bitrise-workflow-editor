import { CSSProperties, useMemo, useRef } from 'react';
import { Box, Button, EmptyState, Notification } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useDebouncedFormValues from '@/hooks/useDebouncedFormValues';
import useColumnCount from '../hooks/useColumnCount';
import useVirtualizedItems from '../hooks/useVirtualizedItems';
import { SearchFormValues, SelectStepHandlerFn } from '../StepSelectorDrawer.types';
import useSearchSteps from '../hooks/useSearchSteps';
import SkeletonRows from './SkeletonRows';
import VirtualizedRow from './VirtualizedRow';

const InitialValues: SearchFormValues = {
  search: '',
  categories: [],
};

type Props = {
  enabledStepIds?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const StepList = ({ enabledStepIds, onSelectStep }: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount({ ref: listRef });
  const { reset, watch } = useFormContext<SearchFormValues>();
  const formValues = useDebouncedFormValues({
    watch,
    initialValues: InitialValues,
  });
  const { data: steps = [], isLoading, isError, refetch: onRetry } = useSearchSteps(formValues);
  const highlightedStepGroups = useMemo(
    () => (enabledStepIds ? { 'Allowed steps': enabledStepIds } : undefined),
    [enabledStepIds],
  );

  const {
    items,
    virtualizer: { getTotalSize, getVirtualItems },
  } = useVirtualizedItems({
    containerRef: listRef,
    columns,
    hideCategoryNames: Boolean(formValues.search),
    selectedCategories: formValues.categories,
    steps,
    enabledStepIds,
    highlightedStepGroups,
  });

  if (isLoading) {
    return <SkeletonRows columns={columns} />;
  }

  if (isError) {
    return (
      <Notification
        status="error"
        action={{
          label: 'Retry',
          placement: 'end',
          onClick: onRetry,
        }}
      >
        Network error: Failed to fetch steps. Please try again.
      </Notification>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        iconName="Magnifier"
        title="No Steps are matching your filter"
        description="Modify your filters to get results."
        padding="48"
      >
        <Button variant="secondary" onClick={() => reset()}>
          Clear filters
        </Button>
      </EmptyState>
    );
  }

  return (
    <Box ref={listRef} maxH="100%" overflow="auto">
      <Box height={getTotalSize()} position="relative">
        {getVirtualItems().map((virtualItem) => {
          const { key, index, start } = virtualItem;
          const item = items[index];
          const style: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: `100%`,
            transform: `translateY(${start}px)`,
          };

          return <VirtualizedRow key={key} style={style} item={item} onSelectStep={onSelectStep} />;
        })}
      </Box>
    </Box>
  );
};

export default StepList;
