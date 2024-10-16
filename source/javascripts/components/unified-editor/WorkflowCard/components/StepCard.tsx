import { useMemo } from 'react';
import { Avatar, Box, ButtonGroup, Card, ControlButton, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import defaultIcon from '@/../images/step/icon-default.svg';
import DragHandle from '@/components/DragHandle/DragHandle';
import VersionUtils from '@/core/utils/VersionUtils';
import { Step } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';

type StepCardProps = {
  uniqueId: string;
  workflowId: string;
  stepIndex: number;
  isSortable?: boolean;
  isDragging?: boolean;
  showSecondary?: boolean;
  actions?: StepActions;
};

const StepCard = ({
  uniqueId,
  workflowId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  actions = {},
}: StepCardProps) => {
  const result = useStep(workflowId, stepIndex);
  const { onStepSelect, onUpgradeStep, onCloneStep, onDeleteStep } = actions;

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      uniqueId,
      stepIndex,
      workflowId,
    } satisfies SortableStepItem,
  });

  const stepVariant = useMemo(() => {
    if (StepService.isWithGroup(result?.data?.cvs || '')) {
      return 'with-group';
    }
    if (StepService.isStepBundle(result?.data?.cvs || '')) {
      return 'step-bundle';
    }
    return 'step';
  }, [result?.data?.cvs]);

  if (!result) {
    return null;
  }

  const { data, isLoading } = result;
  const { cvs, title, icon } = data ?? {};
  const resolvedInfo = (data as Step)?.resolvedInfo;
  const isUpgradable =
    onUpgradeStep && VersionUtils.hasVersionUpgrade(resolvedInfo?.normalizedVersion, resolvedInfo?.versions);
  const latestMajor = VersionUtils.latestMajor(resolvedInfo?.versions)?.toString() ?? '';

  if (isLoading) {
    return (
      <Card display="flex" variant="outline" borderRadius="4" alignItems="center">
        {isSortable && <DragHandle alignSelf="stretch" isDisabled />}
        <Skeleton display="flex" alignItems="center" gap="8" p="4" pl={isSortable ? 0 : 4} isActive>
          <SkeletonBox height="32" width="32" borderRadius="4" />
          <Box display="flex" flexDir="column" gap="4">
            <SkeletonBox height="14" width="150px" />
            {showSecondary && <SkeletonBox height="14" width="75px" />}
          </Box>
        </Skeleton>
      </Card>
    );
  }

  if (sortable.isDragging) {
    return (
      <Box
        height={42}
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

  const isButton = Boolean(onStepSelect);
  const handleClick = isButton ? () => onStepSelect?.(workflowId, stepIndex, stepVariant) : undefined;

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
          withGroupHover
          borderLeftRadius="4"
          ref={sortable.setActivatorNodeRef}
          {...sortable.listeners}
          {...sortable.attributes}
        />
      )}

      <Box
        p="4"
        pl={isSortable ? 0 : 4}
        gap="8"
        flex="1"
        minW={0}
        display="flex"
        as={isButton ? 'button' : 'div'}
        onClick={handleClick}
      >
        <Avatar
          size="32"
          src={icon || defaultIcon}
          variant="step"
          outline="1px solid"
          name={title || cvs || ''}
          outlineColor="border/minimal"
        />

        <Box minW={0} textAlign="left" flex="1">
          <Text textStyle="body/sm/regular" hasEllipsis>
            {title || cvs || ''}
          </Text>
          {showSecondary && (
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {resolvedInfo?.resolvedVersion || 'Always latest'}
            </Text>
          )}
        </Box>

        {Boolean(isUpgradable || onCloneStep || onDeleteStep) && (
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
                iconName="MinusCircle"
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
        )}
      </Box>
    </Card>
  );
};

export default StepCard;
