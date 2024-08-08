import { Avatar, Box, Card, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import { getSortableStepId } from '../WorkflowCard/WorkflowCard.utils';

type StepCardProps = {
  workflowId: string;
  stepIndex: number;
  isDraggable?: boolean;
  showSecondary?: boolean;
  onClick?: VoidFunction;
};

const DragHandle = () => {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2" cy="2" r="1" />
      <circle cx="6" cy="2" r="1" />
      <circle cx="2" cy="6" r="1" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="6" cy="10" r="1" />
    </svg>
  );
};

const StepCard = ({ workflowId, stepIndex, isDraggable, showSecondary = true, onClick }: StepCardProps) => {
  const isButton = Boolean(onClick);
  const sortableStepId = getSortableStepId(workflowId, stepIndex);

  const step = useStep(workflowId, stepIndex);
  const sortable = useSortable({ id: sortableStepId, disabled: !isDraggable });

  const isActive = sortable.active?.id === sortableStepId;

  if (!step) {
    return null;
  }

  const { cvs, isLoading, icon, title, selectedVersion } = step;

  if (isLoading) {
    return (
      <Card p="8" display="flex" variant="outline" borderRadius="4" alignItems="center" pl={isDraggable ? 0 : 8}>
        {isDraggable && (
          <Box
            w="24"
            display="flex"
            alignItems="center"
            borderLeftRadius="4"
            color="text/disabled"
            justifyContent="center"
          >
            <DragHandle />
          </Box>
        )}

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
      borderRadius="4"
      ref={sortable.setNodeRef}
      _hover={isButton ? { borderColor: 'border/hover', boxShadow: 'small' } : undefined}
      {...(isActive ? { zIndex: 999, borderColor: 'border/hover', boxShadow: 'small' } : {})}
      style={{ transition: sortable.transition, transform: CSS.Transform.toString(sortable.transform) }}
    >
      {isDraggable && (
        <Box
          as="button"
          minW={24}
          maxW={24}
          cursor="grab"
          display="flex"
          alignSelf="stretch"
          alignItems="center"
          borderLeftRadius="4"
          justifyContent="center"
          {...sortable.listeners}
          ref={sortable.setActivatorNodeRef}
          _hover={{ backgroundColor: 'background/hover', color: 'icon/secondary' }}
          {...(isActive
            ? { backgroundColor: 'background/hover', color: 'icon/secondary' }
            : { color: 'icon/tertiary' })}
        >
          <DragHandle />
        </Box>
      )}

      <Box
        display="flex"
        p="8"
        gap="8"
        minW={0}
        flex="1"
        as={isButton ? 'button' : 'div'}
        pl={isDraggable ? 0 : 8}
        onClick={onClick}
      >
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
