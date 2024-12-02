import { memo, ReactNode } from 'react';
import {
  Avatar,
  Box,
  ButtonGroup,
  Card,
  ControlButton,
  Icon,
  Skeleton,
  SkeletonBox,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStep from '@/hooks/useStep';
import defaultIcon from '@/../images/step/icon-default.svg';
import DragHandle from '@/components/DragHandle/DragHandle';
import VersionUtils from '@/core/utils/VersionUtils';
import { Step } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';
import getRectFlowViewportScale from '../utils/getReactFlowViewportScale';

type StepSecondaryTextProps = {
  errorText?: string;
  isUpgradable?: boolean;
  resolvedVersion?: string;
};

const StepSecondaryText = ({ errorText, isUpgradable, resolvedVersion }: StepSecondaryTextProps) => {
  let icon: ReactNode = null;

  if (errorText) {
    icon = (
      <Tooltip label={errorText} aria-label={errorText} shouldWrapChildren wrapperProps={{ display: 'flex' }}>
        <Icon ml="4" name="ErrorCircleFilled" size="16" color="icon/negative" />
      </Tooltip>
    );
  }

  if (isUpgradable && !icon) {
    icon = (
      <Tooltip
        label="New version is available"
        aria-label="New version is available"
        shouldWrapChildren
        wrapperProps={{ display: 'flex' }}
      >
        <Icon ml="4" name="WarningYellow" size="16" />
      </Tooltip>
    );
  }

  return (
    <Text hasEllipsis display="flex" textStyle="body/sm/regular" color="text/secondary">
      {resolvedVersion || 'Always latest'}
      {icon}
    </Text>
  );
};

type StepCardProps = StepActions & {
  uniqueId: string;
  workflowId?: string;
  stepBundleId?: string;
  stepIndex: number;
  isSortable?: boolean;
  isDragging?: boolean;
  showSecondary?: boolean;
};

const StepCard = ({
  uniqueId,
  workflowId,
  stepBundleId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  onSelectStep,
  onUpgradeStep,
  onCloneStep,
  onDeleteStep,
}: StepCardProps) => {
  const scale = getRectFlowViewportScale();
  const result = useStep({ workflowId, stepBundleId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();
  const { library } = StepService.parseStepCVS(result?.data?.cvs || '', defaultStepLibrary);

  const parentId = workflowId || stepBundleId || '';

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      uniqueId,
      stepIndex,
      parentId,
    } satisfies SortableStepItem,
  });

  if (!result) {
    return null;
  }

  const { data, error, isLoading } = result;
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

  const style = {
    transition: sortable.transition,
    transform: CSS.Transform.toString(sortable.transform && { ...sortable.transform, y: sortable.transform.y / scale }),
  };

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
        style={style}
      />
    );
  }

  const isButton = Boolean(onSelectStep);
  const handleClick = isButton ? () => onSelectStep?.(parentId, stepIndex, library) : undefined;

  return (
    <Card
      display="flex"
      variant="outline"
      className="group"
      borderRadius="4"
      ref={sortable.setNodeRef}
      _hover={isButton ? { borderColor: 'border/hover' } : {}}
      {...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {})}
      style={style}
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
          backgroundColor="background/primary"
        />

        <Box minW={0} textAlign="left" flex="1">
          <Text textStyle="body/sm/regular" hasEllipsis>
            {title || cvs || ''}
          </Text>
          {showSecondary && (
            <StepSecondaryText
              errorText={error ? 'Failed to load Step' : undefined}
              isUpgradable={isUpgradable}
              resolvedVersion={resolvedInfo?.resolvedVersion}
            />
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
                aria-label="Update Step"
                tooltipProps={{ 'aria-label': 'Update Step' }}
                _groupHover={{ display: 'inline-flex' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpgradeStep?.(parentId, stepIndex, latestMajor ?? '');
                }}
              />
            )}
            {onCloneStep && (
              <ControlButton
                size="xs"
                display="none"
                iconName="Duplicate"
                aria-label="Clone Step"
                tooltipProps={{ 'aria-label': 'Clone Step' }}
                _groupHover={{ display: 'inline-flex' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloneStep(parentId, stepIndex);
                }}
              />
            )}
            {onDeleteStep && (
              <ControlButton
                isDanger
                size="xs"
                display="none"
                iconName="Trash"
                aria-label="Remove Step"
                tooltipProps={{ 'aria-label': 'Remove Step' }}
                _groupHover={{ display: 'inline-flex' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStep(parentId, stepIndex);
                }}
              />
            )}
          </ButtonGroup>
        )}
      </Box>
    </Card>
  );
};

export default memo(StepCard);
