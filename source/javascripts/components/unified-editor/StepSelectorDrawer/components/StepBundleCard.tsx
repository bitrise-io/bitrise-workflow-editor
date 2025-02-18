/* eslint-disable import/no-cycle */
import { useMemo, useRef, MouseEvent } from 'react';
import {
  Box,
  Card,
  CardProps,
  Collapse,
  ControlButton,
  Divider,
  OverflowMenu,
  OverflowMenuItem,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/services/StepBundleService';
import { LibraryType } from '@/core/models/Step';
import DragHandle from '@/components/DragHandle/DragHandle';
import generateUniqueEntityId from '@/core/utils/CommonUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepCardProps } from '../../WorkflowCard/components/StepCard';
import { SortableStepItem } from '../../WorkflowCard/WorkflowCard.types';
import useReactFlowZoom from '../../WorkflowCard/hooks/useReactFlowZoom';
import { useSelection, useStepActions } from '../../WorkflowCard/contexts/WorkflowCardContext';
import StepBundleStepList from '../../WorkflowCard/components/StepBundleStepList';

type StepBundleCardProps = StepCardProps & {
  cvs: string;
  stepBundleId?: string;
  isCollapsable?: boolean;
  isPreviewMode?: boolean;
};

const StepBundleCard = (props: StepBundleCardProps) => {
  const {
    cvs,
    isCollapsable,
    isDragging,
    isPreviewMode = false,
    isSortable,
    stepBundleId,
    stepIndex,
    uniqueId,
    workflowId,
  } = props;

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isCollapsable });
  const containerRef = useRef(null);
  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });
  const { isSelected, selectedStepIndices } = useSelection();
  const { onDeleteStep, onDeleteStepInStepBundle, onGroupStepsToStepBundle, onSelectStep } = useStepActions();
  const zoom = useReactFlowZoom();
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);
  const existingStepBundleIds = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles || {}));

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      cvs,
      uniqueId,
      stepIndex,
      workflowId,
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

  let cardPadding;
  if (isCollapsable) {
    if (!isPreviewMode) {
      cardPadding = '6px 8px 6px 0px';
    }
  } else {
    cardPadding = '4px 8px';
  }

  const isRemovable = onDeleteStep || onDeleteStepInStepBundle;
  const isHighlighted = isSelected({ workflowId, stepBundleId, stepIndex });
  const isPlaceholder = sortable.isDragging;

  const handleClick = onSelectStep
    ? (e: MouseEvent<HTMLDivElement>) => {
        onSelectStep?.({
          isMultiple: e.ctrlKey || e.metaKey,
          stepIndex,
          type: LibraryType.BUNDLE,
          stepBundleId,
          wfId: workflowId,
        });
      }
    : undefined;

  const cardProps = useMemo(() => {
    const common: CardProps = {
      variant: 'outline',
      ...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {}),
      ...(isCollapsable ? { borderRadius: '4' } : { borderRadius: '8' }),
    };

    if (isPlaceholder) {
      return {
        ...common,
        height: 50,
        border: '1px dashed',
        alignItems: 'center',
        color: 'text/secondary',
        justifyContent: 'center',
        textStyle: 'body/sm/regular',
        borderColor: 'border/strong',
        backgroundColor: 'background/secondary',
      } satisfies CardProps;
    }

    return { ...common, ...(isHighlighted ? { outline: '2px solid', outlineColor: 'border/selected' } : {}) };
  }, [isCollapsable, isDragging, isHighlighted, isPlaceholder]);

  const buttonGroup = useMemo(() => {
    const indices = isHighlighted && selectedStepIndices ? selectedStepIndices : [stepIndex];
    const suffix = selectedStepIndices && selectedStepIndices.length > 1 ? 's' : '';

    if ((!workflowId && !stepBundleId) || isDragging || (!onDeleteStep && !onSelectStep)) {
      return null;
    }

    return (
      <OverflowMenu
        placement="bottom-end"
        size="md"
        buttonSize="xs"
        buttonProps={{
          'aria-label': 'Show step actions',
          iconName: 'MoreVertical',
          onClick: (e) => {
            e.stopPropagation();
          },
          display: 'none',
          _groupHover: { display: 'inline-flex' },
          _active: { display: 'inline-flex' },
        }}
      >
        {onGroupStepsToStepBundle && selectedStepIndices && selectedStepIndices.length > 1 && (
          <OverflowMenuItem
            key="group"
            leftIconName="Steps"
            onClick={(e) => {
              e.stopPropagation();
              if (onGroupStepsToStepBundle && selectedStepIndices) {
                const generatedId = generateUniqueEntityId(existingStepBundleIds, 'Step_bundle');
                onGroupStepsToStepBundle(workflowId, stepBundleId, generatedId, indices);
              }
            }}
          >
            New bundle with {selectedStepIndices?.length} Step
            {suffix}
          </OverflowMenuItem>
        )}
        {selectedStepIndices && selectedStepIndices.length > 1 && <Divider key="divider" my="8" />}
        {isRemovable && (
          <OverflowMenuItem
            isDanger
            key="remove"
            leftIconName="Trash"
            onClick={(e) => {
              e.stopPropagation();
              if (workflowId && onDeleteStep) {
                onDeleteStep(workflowId, indices, cvs);
              }
              if (stepBundleId && onDeleteStepInStepBundle) {
                onDeleteStepInStepBundle(stepBundleId, indices, cvs);
              }
            }}
          >
            Delete Step{suffix}
          </OverflowMenuItem>
        )}
      </OverflowMenu>
    );
  }, [
    cvs,
    existingStepBundleIds,
    isDragging,
    isHighlighted,
    isRemovable,
    onDeleteStep,
    onDeleteStepInStepBundle,
    onGroupStepsToStepBundle,
    onSelectStep,
    selectedStepIndices,
    stepBundleId,
    stepIndex,
    workflowId,
  ]);

  return (
    <Card {...cardProps} minW={0} maxW={392} style={style} ref={sortable.setNodeRef}>
      {!isPlaceholder && (
        <>
          <Box display="flex">
            {isSortable && (
              <DragHandle
                withGroupHover
                ref={sortable.setActivatorNodeRef}
                {...sortable.listeners}
                {...sortable.attributes}
              />
            )}
            <Box
              display="flex"
              flexGrow={1}
              alignItems="center"
              padding={cardPadding}
              gap="4"
              className="group"
              minW={0}
              onClick={handleClick}
              role={onSelectStep ? 'button' : 'div'}
            >
              {isCollapsable && (
                <ControlButton
                  size="xs"
                  tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
                  className="nopan"
                  onClick={onToggle}
                  iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} Step Bundle details`}
                  tooltipProps={{
                    'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Step Bundle details`,
                  }}
                />
              )}
              <Box flex="1" minW={0}>
                <Text textStyle="body/md/semibold" hasEllipsis>
                  {StepBundleService.cvsToId(cvs)}
                </Text>
                <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
                  {usedInWorkflowsText}
                </Text>
              </Box>
              {buttonGroup}
            </Box>
          </Box>
          <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
            <Box p="8" ref={containerRef}>
              <StepBundleStepList stepBundleId={StepBundleService.cvsToId(cvs)} />
            </Box>
          </Collapse>
        </>
      )}
    </Card>
  );
};
export default StepBundleCard;
