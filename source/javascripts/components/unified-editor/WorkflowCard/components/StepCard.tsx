import { Avatar, Box, ButtonGroup, Card, ControlButton, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import defaultIcon from '@/../images/step/icon-default.svg';
import DragHandle from '@/components/DragHandle/DragHandle';
import VersionUtils from '@/core/utils/VersionUtils';
import { SortableStepItem, WorkflowCardCallbacks } from '../WorkflowCard.types';

type StepCardProps = Pick<WorkflowCardCallbacks, 'onUpgradeStep' | 'onCloneStep' | 'onDeleteStep'> & {
  uniqueId: string;
  stepIndex: number;
  workflowId: string;
  isSortable?: boolean;
  isDragging?: boolean;
  showSecondary?: boolean;
  onClick?: WorkflowCardCallbacks['onStepSelect'];
};

const StepCard = ({
  uniqueId,
  workflowId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  onClick,
  onUpgradeStep,
  onCloneStep,
  onDeleteStep,
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
  const isUpgradable =
    onUpgradeStep && VersionUtils.hasVersionUpgrade(resolvedInfo?.normalizedVersion, resolvedInfo?.versions);
  const latestMajor = VersionUtils.latestMajor(resolvedInfo?.versions)?.toString() ?? '';

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

  const handleClick = isButton ? () => onClick?.(workflowId, stepIndex) : undefined;

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

      <Box
        display="flex"
        paddingInline="8"
        paddingBlock="4"
        gap="8"
        minW={0}
        flex="1"
        as={isButton ? 'button' : 'div'}
        onClick={handleClick}
      >
        <Avatar
          size="32"
          src={resolvedInfo?.icon || defaultIcon}
          variant="step"
          outline="1px solid"
          name={resolvedInfo?.title || cvs || ''}
          outlineColor="border/minimal"
        />
        <Box minW={0} textAlign="left" flex="1">
          <Text textStyle="body/sm/regular" hasEllipsis>
            {resolvedInfo?.title || cvs}
          </Text>
          {showSecondary && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {resolvedInfo?.resolvedVersion || 'Always latest'}
            </Text>
          )}
        </Box>
        <ButtonGroup spacing="0" display="none" _groupHover={{ display: 'flex' }}>
          {isUpgradable && (
            <ControlButton
              size="xs"
              display="none"
              iconName="ArrowUp"
              colorScheme="orange"
              aria-label="Update to latest step version"
              tooltipProps={{ 'aria-label': 'Update to latest step version' }}
              _groupHover={{ display: 'block' }}
              onClick={(e) => {
                e.stopPropagation();
                onUpgradeStep?.(workflowId, stepIndex, latestMajor ?? '');
              }}
            />
          )}
          {onCloneStep && (
            <ControlButton
              size="xs"
              display="none"
              iconName="Duplicate"
              aria-label="Clone this step"
              tooltipProps={{ 'aria-label': 'Clone this step' }}
              _groupHover={{ display: 'block' }}
              onClick={(e) => {
                e.stopPropagation();
                onCloneStep(workflowId, stepIndex);
              }}
            />
          )}
          {onDeleteStep && (
            <ControlButton
              isDanger
              size="xs"
              display="none"
              iconName="MinusRemove"
              aria-label="Remove this step"
              tooltipProps={{ 'aria-label': 'Remove this step' }}
              _groupHover={{ display: 'block' }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(workflowId, stepIndex);
              }}
            />
          )}
        </ButtonGroup>
      </Box>
    </Card>
  );
};

export default StepCard;
