/* eslint-disable import/no-cycle */
import { Box, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MouseEvent, useMemo, useRef } from 'react';

import DragHandle from '@/components/DragHandle/DragHandle';
import StepMenu from '@/components/unified-editor/WorkflowCard/components/StepMenu';
import { LibraryType } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import useStepBundle from '@/hooks/useStepBundle';

import StepBundleStepList from '../../WorkflowCard/components/StepBundleStepList';
import { StepCardProps } from '../../WorkflowCard/components/StepCard';
import { useSelection, useStepActions } from '../../WorkflowCard/contexts/WorkflowCardContext';
import useReactFlowZoom from '../../WorkflowCard/hooks/useReactFlowZoom';
import { SortableStepItem } from '../../WorkflowCard/WorkflowCard.types';

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
  const { isSelected } = useSelection();
  const { onDeleteStep, onSelectStep } = useStepActions();
  const zoom = useReactFlowZoom();
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

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

  const isHighlighted = isSelected({ workflowId, stepBundleId, stepIndex });
  const isPlaceholder = sortable.isDragging;
  const isButton = onSelectStep && (workflowId || stepBundleId);

  const handleClick = isButton
    ? (e: MouseEvent<HTMLDivElement>) => {
        onSelectStep?.({
          isMultiple: e.ctrlKey || e.metaKey,
          stepIndex,
          type: LibraryType.BUNDLE,
          stepBundleId: stepBundleId,
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
    if ((!workflowId && !stepBundleId) || isDragging || (!onDeleteStep && !onSelectStep)) {
      return null;
    }

    return (
      <StepMenu
        isHighlighted={isHighlighted}
        stepBundleId={stepBundleId}
        stepIndex={stepIndex}
        workflowId={workflowId}
      />
    );
  }, [isDragging, isHighlighted, onDeleteStep, onSelectStep, stepBundleId, stepIndex, workflowId]);

  const stepBundleInstance = useStepBundle({
    stepBundleId: StepBundleService.cvsToId(cvs),
    parentWorkflowId: workflowId,
    parentStepBundleId: stepBundleId,
    stepIndex,
  });

  const title = stepBundleInstance.stepBundle?.mergedValues?.title || StepBundleService.cvsToId(cvs);

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
              role={isButton ? 'button' : 'div'}
            >
              {isCollapsable && (
                <ControlButton
                  size="xs"
                  tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
                  className="nopan"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} Step Bundle details`}
                  tooltipProps={{
                    'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Step Bundle details`,
                  }}
                />
              )}
              <Box flex="1" minW={0}>
                <Text textStyle="body/md/semibold" hasEllipsis>
                  {title}
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
              <StepBundleStepList stepBundleId={StepBundleService.cvsToId(cvs)} workflowId={workflowId} />
            </Box>
          </Collapse>
        </>
      )}
    </Card>
  );
};

export default StepBundleCard;
