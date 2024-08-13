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
import { StepEditCallback, MoveStepCallback } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';

type Props = {
  workflowId: string;
  containerProps?: BoxProps;
  onAddStep?: StepEditCallback;
  onMoveStep?: MoveStepCallback;
  onSelectStep?: StepEditCallback;
};

const getSortableIds = (workflowId: string, steps?: Steps) => {
  return steps?.map((_, index) => getSortableStepId(workflowId, index)) ?? [];
};

const StepList = ({ workflowId, containerProps, onAddStep, onMoveStep, onSelectStep }: Props) => {
  const steps = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return yml.workflows?.[workflowId]?.steps;
    }),
  );

  const isEmpty = !steps?.length;
  const isSortable = Boolean(onMoveStep);
  const sortableIds = useMemo(() => getSortableIds(workflowId, steps), [steps, workflowId]);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { stepIndex } = parseSortableStepId(e.active.id.toString());
      const { stepIndex: to } = parseSortableStepId(e.over?.id.toString() || '');
      onMoveStep?.(workflowId, stepIndex, to);
    },
    [onMoveStep, workflowId],
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
          const handleClickStepCard = onSelectStep && (() => onSelectStep(workflowId, index));

          return (
            <StepCard
              id={sortableId}
              onClick={handleClickStepCard}
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
            const handleClickAddStep = onAddStep && (() => onAddStep(workflowId, index + 1));
            const handleClickStepCard = onSelectStep && (() => onSelectStep(workflowId, index));

            return (
              <Fragment key={`${sortableId}->${Object.keys(steps[index])[0]}`}>
                <AddStepButton my={-8} zIndex={10} onClick={handleClickAddStep} />
                <StepCard
                  id={sortableId}
                  isSortable={isSortable}
                  onClick={handleClickStepCard}
                  {...parseSortableStepId(sortableId)}
                />
                {isLast && <AddStepButton my={-8} zIndex={10} onClick={handleClickAddStep} />}
              </Fragment>
            );
          })}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

export default StepList;
