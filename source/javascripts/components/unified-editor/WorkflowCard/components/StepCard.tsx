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
  Divider,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonBox,
  Text,
  Toggletip,
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
    (onUpgradeStep || onUpgradeStepInStepBundle) &&
    VersionUtils.hasVersionUpgrade(step?.resolvedInfo?.normalizedVersion, step?.resolvedInfo?.versions);
  const isClonable = onCloneStep || onCloneStepInStepBundle;
  const isRemovable = onDeleteStep || onDeleteStepInStepBundle;

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
    if (!(workflowId || stepBundleId) || isDragging || (!isUpgradable && !isClonable && !isRemovable)) {
      return null;
    }

    return (
      <ButtonGroup spacing="0" display="flex">
        {isRemovable && (
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
              if (workflowId && onDeleteStep) {
                onDeleteStep(workflowId, stepIndex);
              }
              if (stepBundleId && onDeleteStepInStepBundle) {
                onDeleteStepInStepBundle(stepBundleId, stepIndex);
              }
            }}
          />
        )}
        <Menu placement="bottom-end">
          <MenuButton
            as={ControlButton}
            iconName="MoreVertical"
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="xs"
            display="none"
            _groupHover={{ display: 'inline-flex' }}
            _active={{ display: 'inline-flex' }}
          />
          <MenuList>
            {isUpgradable && (
              <MenuItem
                leftIconName="ArrowUp"
                onClick={(e) => {
                  e.stopPropagation();
                  if (workflowId && onUpgradeStep) {
                    onUpgradeStep(workflowId, stepIndex, latestMajor);
                  }
                  if (stepBundleId && onUpgradeStepInStepBundle) {
                    onUpgradeStepInStepBundle(stepBundleId, stepIndex, latestMajor);
                  }
                }}
              >
                Update Step version
              </MenuItem>
            )}
            <MenuItem leftIconName="Steps">New bundle with 1 Step</MenuItem>
            <MenuItem
              leftIconName="Duplicate"
              onClick={(e) => {
                e.stopPropagation();
                if (workflowId && onCloneStep) {
                  onCloneStep(workflowId, stepIndex);
                }
                if (stepBundleId && onCloneStepInStepBundle) {
                  onCloneStepInStepBundle(stepBundleId, stepIndex);
                }
              }}
            >
              Duplicate Step
            </MenuItem>
            <Divider my="8" />
            <MenuItem
              isDanger
              leftIconName="Trash"
              onClick={(e) => {
                e.stopPropagation();
                if (workflowId && onDeleteStep) {
                  onDeleteStep(workflowId, stepIndex);
                }
                if (stepBundleId && onDeleteStepInStepBundle) {
                  onDeleteStepInStepBundle(stepBundleId, stepIndex);
                }
              }}
            >
              Delete Step
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
    );
  }, [
    isClonable,
    isDragging,
    isRemovable,
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
    <Toggletip
      label="To select multiple Steps, hold '⌘' or 'Ctrl' key."
      learnMoreUrl="https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/step-bundles.html#creating-a-step-bundle"
      button={{ label: 'Got it' }}
    >
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
    </Toggletip>
  );
};

export default memo(StepCard);
