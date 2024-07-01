import { CSSProperties, useRef } from 'react';
import { Box, Button, EmptyState, Notification } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useColumnCount from '../hooks/useColumnCount';
import useDebouncedFormValues from '../hooks/useDebouncedFormValues';
import useSearchSteps from '../hooks/useSearchSteps';
import useVirtualizedItems from '../hooks/useVirtualizedItems';
import { SearchFormValues, StepSelected } from '../StepDrawer.types';
import SkeletonRows from './SkeletonRows';
import VirtualizedRow from './VirtualizedRow';

type Props = {
  onStepSelected: StepSelected;
};

const StepList = ({ onStepSelected }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount();
  const { reset } = useFormContext<SearchFormValues>();
  const formValues = useDebouncedFormValues();
  const { data: stepsByCategories = {}, isLoading, isError, refetch } = useSearchSteps(formValues);
  const { items, virtualizer } = useVirtualizedItems({
    containerRef: parentRef,
    stepsByCategories,
    columns,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) {
    return <SkeletonRows columns={columns} />;
  }

  if (isError) {
    return (
      <Notification
        action={{
          label: 'Retry',
          placement: 'end',
          onClick: () => {
            refetch();
          },
        }}
        status="error"
      >
        Failed to fetch steps
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
    <Box ref={parentRef} maxH="100%" overflow="auto">
      <Box height={`${virtualizer.getTotalSize()}px`} position="relative">
        {virtualItems.map((virtualItem) => {
          const { key, index, start } = virtualItem;
          const item = items[index];
          const style: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: `100%`,
            transform: `translateY(${start}px)`,
          };

          return <VirtualizedRow key={key} style={style} item={item} onStepSelected={onStepSelected} />;
        })}
      </Box>
    </Box>
  );
};

export default StepList;
