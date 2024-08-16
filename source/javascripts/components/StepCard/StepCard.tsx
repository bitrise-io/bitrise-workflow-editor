import { Avatar, Box, Card, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import DragHandle from '../DragHandle/DragHandle';

type StepCardProps = {
  id?: string;
  stepIndex: number;
  workflowId: string;
  isSortable?: boolean;
  showSecondary?: boolean;
  onClick?: VoidFunction;
};

const StepCard = ({ id, workflowId, stepIndex, isSortable, showSecondary = true, onClick }: StepCardProps) => {
  const isButton = Boolean(onClick);
  const sortableStepId = id ?? `${workflowId}->${stepIndex}`;

  const step = useStep(workflowId, stepIndex);
  const sortable = useSortable({ id: sortableStepId, disabled: !isSortable });

  const isActive = sortable.active?.id === sortableStepId;

  if (!step) {
    return null;
  }

  const { cvs, isLoading, icon, title, selectedVersion } = step;

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

  return (
    <Card
      display="flex"
      variant="outline"
      className="group"
      borderRadius="4"
      ref={sortable.setNodeRef}
      _hover={isButton ? { borderColor: 'border/hover', boxShadow: 'small' } : undefined}
      {...(isActive ? { zIndex: 999, borderColor: 'border/hover', boxShadow: 'small' } : {})}
      style={{ transition: sortable.transition, transform: CSS.Transform.toString(sortable.transform) }}
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
          src={icon}
          variant="step"
          outline="1px solid"
          name={title || cvs}
          outlineColor="border/minimal"
        />
        <Box minW={0} textAlign="left">
          <Text textStyle="body/sm/regular" hasEllipsis>
            {title}
          </Text>
          {showSecondary && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {selectedVersion || 'Always latest'}
            </Text>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default StepCard;
