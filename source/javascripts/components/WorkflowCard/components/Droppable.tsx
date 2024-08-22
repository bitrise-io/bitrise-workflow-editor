import { Box, BoxProps } from '@bitrise/bitkit';
import { useDroppable } from '@dnd-kit/core';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import { SortableWorkflowItem } from '../WorkflowCard.types';

type Props = {
  placement: Placement;
  parentWorkflowId: string;
  containerProps?: BoxProps;
};

const Droppable = ({ placement, parentWorkflowId, containerProps }: Props) => {
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

  return (
    <Box
      height={50}
      display="flex"
      borderRadius="4"
      border="1px dashed"
      alignItems="center"
      color="text/secondary"
      justifyContent="center"
      ref={droppable.setNodeRef}
      textStyle="body/sm/regular"
      borderColor="border/strong"
      backgroundColor="background/secondary"
      {...containerProps}
    >
      {placement}
    </Box>
  );
};

export default Droppable;
