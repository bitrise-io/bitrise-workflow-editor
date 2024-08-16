import { Fragment, useCallback, useMemo } from 'react';
import { Box, BoxProps, Card, Text } from '@bitrise/bitkit';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useShallow } from 'zustand/react/shallow';
import { Steps } from '@/models/Step';
import StepCard from '@/components/StepCard/StepCard';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { getSortableStepId, parseSortableStepId } from '../WorkflowCard.utils';
import { WorkflowCardCallbacks } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';

type Props = Pick<WorkflowCardCallbacks, 'onAddStepClick' | 'onStepMove' | 'onStepSelect'> & {
  workflowId: string;
  containerProps?: BoxProps;
};

const getSortableIds = (workflowId: string, steps?: Steps) => {
  return steps?.map((_, index) => getSortableStepId(workflowId, index)) ?? [];
};

const StepList = ({ workflowId, containerProps, onAddStepClick, onStepMove, onStepSelect }: Props) => {
  const steps = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return yml.workflows?.[workflowId]?.steps;
    }),
  );

  const isEmpty = !steps?.length;
  const isSortable = Boolean(onStepMove);
  const sortableIds = useMemo(() => getSortableIds(workflowId, steps), [steps, workflowId]);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { stepIndex } = parseSortableStepId(e.active.id.toString());
      const { stepIndex: to } = parseSortableStepId(e.over?.id.toString() || '');
      onStepMove?.(workflowId, stepIndex, to);
    },
    [onStepMove, workflowId],
  );

  if (isEmpty) {
    return (
      <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
        <Text textStyle="body/sm/regular" color="text/secondary">
          This Workflow is empty.
        </Text>
      </Card>
    );
  }

  if (!isSortable) {
    return (
      <Box display="flex" flexDir="column" gap="8" {...containerProps}>
        {sortableIds.map((sortableId, index) => {
          const handleStepSelect = onStepSelect && (() => onStepSelect(workflowId, index));

          return (
            <StepCard
              id={sortableId}
              onClick={handleStepSelect}
              key={`${sortableId}->${Object.keys(steps[index])[0]}`}
              {...parseSortableStepId(sortableId)}
            />
          );
        })}
      </Box>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
      <SortableContext items={sortableIds} disabled={!isSortable} strategy={verticalListSortingStrategy}>
        <Box display="flex" flexDir="column" gap="8" {...containerProps}>
          {sortableIds.map((sortableId, index) => {
            const isLast = index === sortableIds.length - 1;
            const handleAddStepClick = onAddStepClick && (() => onAddStepClick(workflowId, index + 1));
            const handleStepSelect = onStepSelect && (() => onStepSelect(workflowId, index));

            return (
              <Fragment key={`${sortableId}->${Object.keys(steps[index])[0]}`}>
                <AddStepButton my={-8} zIndex={10} onClick={handleAddStepClick} />
                <StepCard
                  id={sortableId}
                  isSortable={isSortable}
                  onClick={handleStepSelect}
                  {...parseSortableStepId(sortableId)}
                />
                {isLast && <AddStepButton my={-8} zIndex={10} onClick={handleAddStepClick} />}
              </Fragment>
            );
          })}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

export default StepList;
