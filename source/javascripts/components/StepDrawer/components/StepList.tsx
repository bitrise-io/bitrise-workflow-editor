import { CSSProperties, useMemo, useRef } from 'react';
import { Box, Button, EmptyState, useResponsive } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import useSearchSteps from '../hooks/useSearchSteps';
import useDebouncedFormValues from '../hooks/useDebouncedFormValues';
import useVirtualizedItems from '../hooks/useVirtualizedItems';
import { RowGaps, RowHeights, RowSizes } from '../contants';
import { SearchFormValues } from '../StepDrawer.types';
import VirtualizedRow from './VirtualizedRow';
import SkeletonRows from './SkeletonRows';

type Props = {
  onStepSelected: (cvs: string) => void;
};

const StepList = ({ onStepSelected }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsive();
  const columns = useMemo(() => {
    if (responsive.isWideDesktop) {
      return 3;
    }
    if (responsive.isDesktop) {
      return 2;
    }
    return 1;
  }, [responsive]);
  const { reset } = useFormContext<SearchFormValues>();
  const formValues = useDebouncedFormValues();
  const { data: stepsByCategories = {}, isLoading, isError } = useSearchSteps(formValues);
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
    return <Box>Error...</Box>;
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
            minHeight: item.type === 'category' ? `${RowSizes.category}px` : `${RowHeights.steps}px`,
            marginBottom: item.type === 'category' ? `${RowGaps.category}px` : `${RowGaps.steps}px`,
          };

          return (
            <Box ref={virtualizer.measureElement} key={key}>
              <VirtualizedRow style={style} columns={columns} item={item} onStepSelected={onStepSelected} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default StepList;
