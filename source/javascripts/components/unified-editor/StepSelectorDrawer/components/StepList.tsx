import { CSSProperties, useMemo, useRef } from 'react';
import { Box, Button, EmptyState, Notification } from '@bitrise/bitkit';
import useColumnCount from '../hooks/useColumnCount';
import useVirtualizedItems from '../hooks/useVirtualizedItems';
import { SelectStepHandlerFn } from '../StepSelectorDrawer.types';
import useSearchSteps from '../hooks/useSearchSteps';
import useSearch from '../hooks/useSearch';
import SkeletonRows from './SkeletonRows';
import VirtualizedRow from './VirtualizedRow';

type Props = {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const StepList = ({ enabledSteps, onSelectStep }: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount({ ref: listRef });

  const reset = useSearch((s) => s.reset);
  const searchStep = useSearch((s) => s.searchStep);
  const searchStepCategories = useSearch((s) => s.searchStepCategories);

  const {
    isError,
    isLoading,
    data: steps = [],
    refetch: onRetry,
  } = useSearchSteps({
    categories: searchStepCategories,
    searchSteps: searchStep,
  });

  const highlightedStepGroups = useMemo(
    () => (enabledSteps ? { 'Allowed steps': enabledSteps } : undefined),
    [enabledSteps],
  );

  const {
    items,
    virtualizer: { getTotalSize, getVirtualItems },
  } = useVirtualizedItems({
    containerRef: listRef,
    columns,
    hideCategoryNames: Boolean(searchStep),
    selectedCategories: searchStepCategories,
    steps,
    enabledSteps,
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
    <Box ref={listRef} height={getTotalSize()} position="relative">
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
  );
};

export default StepList;
