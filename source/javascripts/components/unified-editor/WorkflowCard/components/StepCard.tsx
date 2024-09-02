import { Avatar, Box, Card, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import defaultIcon from '@/../images/step/icon-default.svg';
import DragHandle from '@/components/DragHandle/DragHandle';
import { SortableStepItem } from '../WorkflowCard.types';

type StepCardProps = {
  uniqueId: string;
  stepIndex: number;
  workflowId: string;
  isSortable?: boolean;
  isDragging?: boolean;
  showSecondary?: boolean;
  onClick?: VoidFunction;
};

const StepCard = ({
  uniqueId,
  workflowId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  onClick,
}: StepCardProps) => {
  const result = useStep(workflowId, stepIndex);

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      uniqueId,
      stepIndex,
      workflowId,
    } satisfies SortableStepItem,
  });

  const isButton = Boolean(onClick);

  if (!result) {
    return null;
  }

  const { data, isLoading } = result;
  const { cvs, resolvedInfo } = data ?? {};

  if (isLoading) {
    return (
      <Card p="8" display="flex" variant="outline" borderRadius="4" alignItems="center">
        {isSortable && <DragHandle ml="-8" my="-8" alignSelf="stretch" isDisabled />}
        <Skeleton display="flex" alignItems="center" gap="8" isActive>
          <SkeletonBox height="32" width="32" borderRadius="4" />
          <Box display="flex" flexDir="column" gap="4">
            <SkeletonBox height="14" width="250px" />
            {showSecondary && <SkeletonBox height="14" width="100px" />}
          </Box>
        </Skeleton>
      </Card>
    );
  }

  if (sortable.isDragging) {
    return (
      <Box
        height={50}
        display="flex"
        borderRadius="4"
        border="1px dashed"
        alignItems="center"
        color="text/secondary"
        justifyContent="center"
        ref={sortable.setNodeRef}
        textStyle="body/sm/regular"
        borderColor="border/strong"
        backgroundColor="background/secondary"
        style={{
          transition: sortable.transition,
          transform: CSS.Transform.toString(sortable.transform),
        }}
      />
    );
  }

  return (
    <Card
      display="flex"
      variant="outline"
      className="group"
      borderRadius="4"
      ref={sortable.setNodeRef}
      _hover={isButton ? { borderColor: 'border/hover' } : {}}
      {...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {})}
      style={{
        transition: sortable.transition,
        transform: CSS.Transform.toString(sortable.transform),
      }}
    >
      {isSortable && (
        <DragHandle
          mr="-8"
          withGroupHover
          borderLeftRadius="4"
          ref={sortable.setActivatorNodeRef}
          {...sortable.listeners}
          {...sortable.attributes}
        />
      )}

      <Box display="flex" p="8" gap="8" minW={0} flex="1" as={isButton ? 'button' : 'div'} onClick={onClick}>
        <Avatar
          size="32"
          src={resolvedInfo?.icon || defaultIcon}
          variant="step"
          outline="1px solid"
          name={resolvedInfo?.title || cvs || ''}
          outlineColor="border/minimal"
        />
        <Box minW={0} textAlign="left">
          <Text textStyle="body/sm/regular" hasEllipsis>
            {resolvedInfo?.title || cvs}
          </Text>
          {showSecondary && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {resolvedInfo?.resolvedVersion || 'Always latest'}
            </Text>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default StepCard;
