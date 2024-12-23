import { memo, ReactNode, useMemo } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import {
  Avatar,
  Box,
  ButtonGroup,
  Card,
  CardProps,
  ControlButton,
  Icon,
  Skeleton,
  SkeletonBox,
  Text,
  Tooltip,
} from '@bitrise/bitkit';

import useStep from '@/hooks/useStep';
import DragHandle from '@/components/DragHandle/DragHandle';
import defaultIcon from '@/../images/step/icon-default.svg';

import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import StepService from '@/core/models/StepService';
import { Step } from '@/core/models/Step';
import VersionUtils from '@/core/utils/VersionUtils';
import useReactFlowZoom from '../hooks/useReactFlowZoom';
import { useSelection, useStepActions } from '../contexts/WorkflowCardContext';
import { SortableStepItem } from '../WorkflowCard.types';

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

export type StepCardProps = {
  uniqueId: string;
  workflowId?: string;
  stepBundleId?: string;
  stepIndex: number;
  isSortable?: boolean;
  isDragging?: boolean;
  isPreviewMode?: boolean;
  showSecondary?: boolean;
};

const StepCard = ({
  uniqueId,
  workflowId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  stepBundleId,
}: StepCardProps) => {
  const zoom = useReactFlowZoom();
  const { isSelected } = useSelection();
  const defaultStepLibrary = useDefaultStepLibrary();
  const {
    onCloneStep,
    onCloneStepInStepBundle,
    onDeleteStep,
    onDeleteStepInStepBundle,
    onSelectStep,
    onUpgradeStep,
    onUpgradeStepInStepBundle,
  } = useStepActions();

  const {
    error,
    isLoading,
    data: step,
  } = useStep({ workflowId, stepBundleId, stepIndex }) as {
    data?: Step;
    error?: Error;
    isLoading: boolean;
  };

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      uniqueId,
      stepIndex,
      workflowId,
      stepBundleId,
    } satisfies SortableStepItem,
  });

  const style = {
    transition: sortable.transition,
    transform: CSS.Transform.toString(
      sortable.transform && {
        ...sortable.transform,
        y: sortable.transform.y / zoom,
      },
    ),
  };

  const icon = step?.icon || defaultIcon;
  const title = step?.title || step?.cvs || '';
  const isHighlighted = isSelected(workflowId || '', stepIndex);
  const { library } = StepService.parseStepCVS(step?.cvs || '', defaultStepLibrary);
  const latestMajor = VersionUtils.latestMajor(step?.resolvedInfo?.versions)?.toString() ?? '';

  const isButton = !!onSelectStep;
  const isPlaceholder = sortable.isDragging;
  const isUpgradable =
    onUpgradeStep &&
    VersionUtils.hasVersionUpgrade(step?.resolvedInfo?.normalizedVersion, step?.resolvedInfo?.versions);

  const handleClick = isButton
    ? () => onSelectStep?.({ stepIndex, type: library, stepBundleId, wfId: workflowId })
    : undefined;
  const cardProps = useMemo(() => {
    const common: CardProps = {
      display: 'flex',
      borderRadius: '4',
      variant: 'outline',
      className: 'group',
      ...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {}),
    };

    if (isPlaceholder) {
      return {
        ...common,
        height: 42,
        display: 'flex',
        border: '1px dashed',
        alignItems: 'center',
        color: 'text/secondary',
        justifyContent: 'center',
        textStyle: 'body/sm/regular',
        borderColor: 'border/strong',
        backgroundColor: 'background/secondary',
      } satisfies CardProps;
    }

    if (isButton) {
      return {
        ...common,
        ...(isHighlighted ? { outline: '2px solid', outlineColor: 'border/selected' } : {}),
        _hover: { borderColor: 'border/hover' },
      };
    }

    return common;
  }, [isDragging, isPlaceholder, isButton, isHighlighted]);

  const buttonGroup = useMemo(() => {
    if (!(workflowId || stepBundleId) || isDragging || (!isUpgradable && !onCloneStep && !onDeleteStep)) {
      return null;
    }

    return (
      <ButtonGroup spacing="0" display="none" _groupHover={{ display: 'flex' }}>
        {isUpgradable && onUpgradeStepInStepBundle && (
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
              if (workflowId) {
                onUpgradeStep(workflowId, stepIndex, latestMajor);
              }
              if (stepBundleId) {
                onUpgradeStepInStepBundle(stepBundleId, stepIndex, latestMajor);
              }
            }}
          />
        )}
        {onCloneStep && onCloneStepInStepBundle && (
          <ControlButton
            size="xs"
            display="none"
            iconName="Duplicate"
            aria-label="Clone Step"
            tooltipProps={{ 'aria-label': 'Clone Step' }}
            _groupHover={{ display: 'inline-flex' }}
            onClick={(e) => {
              e.stopPropagation();
              if (workflowId) {
                onCloneStep(workflowId, stepIndex);
              }
              if (stepBundleId) {
                onCloneStepInStepBundle(stepBundleId, stepIndex);
              }
            }}
          />
        )}
        {onDeleteStep && onDeleteStepInStepBundle && (
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
              if (workflowId) {
                onDeleteStep(workflowId, stepIndex);
              }
              if (stepBundleId) {
                onDeleteStepInStepBundle(stepBundleId, stepIndex);
              }
            }}
          />
        )}
      </ButtonGroup>
    );
  }, [
    isDragging,
    isUpgradable,
    latestMajor,
    onCloneStep,
    onCloneStepInStepBundle,
    onDeleteStep,
    onDeleteStepInStepBundle,
    onUpgradeStep,
    onUpgradeStepInStepBundle,
    stepBundleId,
    stepIndex,
    workflowId,
  ]);

  return (
    <Card ref={sortable.setNodeRef} {...cardProps} style={style}>
      {!isPlaceholder && (
        <>
          {isSortable && (
            <DragHandle
              withGroupHover
              borderLeftRadius="4"
              isDisabled={isLoading}
              ref={sortable.setActivatorNodeRef}
              {...sortable.listeners}
              {...sortable.attributes}
            />
          )}

          {isLoading ? (
            <Skeleton display="flex" alignItems="center" gap="8" p="4" pl={isSortable ? 0 : 4} isActive>
              <SkeletonBox height="32" width="32" borderRadius="4" />
              <Box display="flex" flexDir="column" gap="4">
                <SkeletonBox height="14" width="150px" />
                {showSecondary && <SkeletonBox height="14" width="75px" />}
              </Box>
            </Skeleton>
          ) : (
            <Box
              p="4"
              pl={isSortable ? 0 : 4}
              gap="8"
              flex="1"
              minW={0}
              display="flex"
              onClick={handleClick}
              role={isButton ? 'button' : 'div'}
            >
              <Avatar
                size="32"
                src={icon}
                name={title}
                variant="step"
                outline="1px solid"
                outlineColor="border/minimal"
                backgroundColor="background/primary"
              />

              <Box minW={0} textAlign="left" flex="1">
                <Text textStyle="body/sm/regular" hasEllipsis>
                  {title}
                </Text>
                {showSecondary && (
                  <StepSecondaryText
                    isUpgradable={isUpgradable}
                    errorText={error ? 'Failed to load Step' : undefined}
                    resolvedVersion={step?.resolvedInfo?.resolvedVersion}
                  />
                )}
              </Box>

              {buttonGroup}
            </Box>
          )}
        </>
      )}
    </Card>
  );
};

export default memo(StepCard);
