import { memo } from 'react';
import { Box, BoxProps } from '@bitrise/bitkit';
import { useDroppable } from '@dnd-kit/core';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import { SortableWorkflowItem } from '../WorkflowCard.types';

type Props = BoxProps & {
  placement: Placement;
  parentWorkflowId: string;
};

const Droppable = ({ placement, parentWorkflowId, ...props }: Props) => {
  const droppable = useDroppable({
    id: placement,
    data: {
      index: 0,
      placement,
      id: placement,
      parentWorkflowId,
      uniqueId: placement,
    } satisfies SortableWorkflowItem,
  });

  return <Box ref={droppable.setNodeRef} {...props} />;
};

export default memo(Droppable);
