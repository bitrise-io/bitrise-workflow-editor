import { Avatar, Box, Card, CardProps, ColorButton, Icon, Skeleton, SkeletonBox, Text, Tooltip } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Popover, PopoverAnchor, PopoverArrow, PopoverBody, PopoverContent } from 'chakra-ui-2--react';
import { memo, MouseEvent, ReactNode, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import defaultIcon from '@/../images/step/icon-default.svg';
import DragHandle from '@/components/DragHandle/DragHandle';
import { Step } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import VersionUtils from '@/core/utils/VersionUtils';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import useStep from '@/hooks/useStep';

import { useSelection, useStepActions } from '../contexts/WorkflowCardContext';
import useReactFlowZoom from '../hooks/useReactFlowZoom';
import { SortableStepItem } from '../WorkflowCard.types';
import StepMenu from './StepMenu';

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
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
  isSortable?: boolean;
  isDragging?: boolean;
  showSecondary?: boolean;
  cvs: string;
};

const StepCard = ({
  uniqueId,
  parentWorkflowId,
  stepIndex,
  isSortable,
  isDragging,
  showSecondary = true,
  parentStepBundleId,
  cvs,
}: StepCardProps) => {
  const zoom = useReactFlowZoom();
  const [isMultiSelectAccepted, setIsMultiSelectAccepted] = useLocalStorage('multiSelectAccepted', false);
  const { isSelected, selectedStepIndices } = useSelection();
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
  } = useStep({ parentWorkflowId, parentStepBundleId, stepIndex }) as {
    data?: Step;
    error?: Error;
    isLoading: boolean;
  };

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      cvs,
      uniqueId,
      stepIndex,
      parentWorkflowId,
      parentStepBundleId,
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
  const isHighlighted = isSelected({ parentStepBundleId, stepIndex, parentWorkflowId });
  const { library } = StepService.parseStepCVS(step?.cvs || '', defaultStepLibrary);

  const isButton = !!onSelectStep;
  const isPlaceholder = sortable.isDragging;
  const isUpgradable =
    (onUpgradeStep || onUpgradeStepInStepBundle) &&
    VersionUtils.hasVersionUpgrade(step?.resolvedInfo?.normalizedVersion, step?.resolvedInfo?.versions);
  const isClonable = onCloneStep || onCloneStepInStepBundle;
  const isRemovable = onDeleteStep || onDeleteStepInStepBundle;

  const handleClick = isButton
    ? (e: MouseEvent<HTMLDivElement>) => {
        onSelectStep?.({
          isMultiple: e.ctrlKey || e.metaKey,
          stepIndex,
          type: library,
          parentStepBundleId,
          parentWorkflowId,
        });
      }
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
    if (!(parentWorkflowId || parentStepBundleId) || isDragging || (!isUpgradable && !isClonable && !isRemovable)) {
      return null;
    }

    return (
      <StepMenu
        isHighlighted={isHighlighted}
        isUpgradable={isUpgradable}
        step={step}
        stepBundleId={parentStepBundleId}
        stepIndex={stepIndex}
        workflowId={parentWorkflowId}
      />
    );
  }, [
    parentWorkflowId,
    parentStepBundleId,
    isDragging,
    isUpgradable,
    isClonable,
    isRemovable,
    isHighlighted,
    step,
    stepIndex,
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
            <Skeleton display="flex" alignItems="center" gap="8" p="4" pl={isSortable ? 0 : 4}>
              <SkeletonBox height="32" width="32" borderRadius="4" />
              <Box display="flex" flexDir="column" gap="4">
                <SkeletonBox height="14" width="150px" />
                {showSecondary && <SkeletonBox height="14" width="75px" />}
              </Box>
            </Skeleton>
          ) : (
            <Popover isLazy isOpen={isHighlighted && selectedStepIndices?.length === 1} placement="top">
              <PopoverAnchor>
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
              </PopoverAnchor>
              {!isMultiSelectAccepted && (
                <PopoverContent
                  background="neutral.10"
                  color="neutral.100"
                  sx={{
                    '--popper-arrow-bg': '#201b22',
                  }}
                >
                  <PopoverArrow />
                  <PopoverBody
                    display="flex"
                    alignItems="center"
                    color="neutral.100"
                    padding="16"
                    textStyle="body/md/regular"
                  >
                    <Text paddingRight="16">To select multiple Steps, hold ‘⌘’ or 'Ctrl' key.</Text>
                    <ColorButton colorScheme="neutral" onClick={() => setIsMultiSelectAccepted(true)} size="xs">
                      Got it
                    </ColorButton>
                  </PopoverBody>
                </PopoverContent>
              )}
            </Popover>
          )}
        </>
      )}
    </Card>
  );
};

export default memo(StepCard);
