import { useMemo, useRef } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import { LibraryType } from '@/core/models/Step';
import DragHandle from '@/components/DragHandle/DragHandle';
import { StepCardProps } from '../../WorkflowCard/components/StepCard';
import { SortableStepItem, StepActions } from '../../WorkflowCard/WorkflowCard.types';
import useReactFlowZoom from '../../WorkflowCard/hooks/useReactFlowZoom';
import { useSelection, useStepActions } from '../../WorkflowCard/contexts/WorkflowCardContext';
import StepBundleStepList from '../../WorkflowCard/components/StepBundleStepList';

type StepBundleCardProps = StepCardProps &
  StepActions & {
    cvs: string;
    isCollapsable?: boolean;
    isPreviewMode?: boolean;
    onDeleteStepBundle?: (stepBundleId: string, stepIndex: number) => void;
  };

const StepBundleCard = (props: StepBundleCardProps) => {
  const {
    cvs,
    isCollapsable,
    isDragging,
    isPreviewMode,
    isSortable,
    onDeleteStepBundle,
    stepBundleId,
    stepIndex,
    uniqueId,
    workflowId,
    ...rest
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

  const isHighlighted = workflowId && isSelected(workflowId, stepIndex);
  const isPlaceholder = sortable.isDragging;

  const cardProps = useMemo(() => {
    const common: CardProps = {
      borderRadius: '4',
      variant: 'outline',
      ...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {}),
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
  }, [isDragging, isHighlighted, isPlaceholder]);

  const buttonGroup = useMemo(() => {
    if (!stepBundleId || isDragging || (!onDeleteStepBundle && !onDeleteStep && !onSelectStep)) {
      return null;
    }

    return (
      <ButtonGroup spacing="0" display="none" _groupHover={{ display: 'flex' }}>
        {onSelectStep && (
          <ControlButton
            iconName="Settings"
            aria-label="Settings"
            size="xs"
            onClick={() => {
              onSelectStep({ stepIndex, type: LibraryType.BUNDLE, wfId: workflowId });
            }}
          />
        )}
        {onDeleteStepBundle && (
          <ControlButton
            iconName="Trash"
            aria-label="Remove Step bundle"
            size="xs"
            isDanger
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteStep && workflowId) {
                onDeleteStep(workflowId, stepIndex);
              }
              onDeleteStepBundle(stepBundleId, stepIndex);
            }}
          />
        )}
      </ButtonGroup>
    );
  }, [isDragging, onDeleteStep, onDeleteStepBundle, onSelectStep, stepBundleId, stepIndex, workflowId]);

  return (
    <Card {...cardProps} minW={0} style={style} ref={sortable.setNodeRef}>
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
              padding={isPreviewMode ? '6px 8px' : '6px 8px 6px 0px'}
              gap="4"
              className="group"
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
              <Box display="flex" flexDir="column" flex="1">
                <Text textStyle="body/md/semibold" hasEllipsis>
                  {cvs.replace('bundle::', '')}
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
              <StepBundleStepList stepBundleId={cvs.replace('bundle::', '')} isPreviewMode={isPreviewMode} {...rest} />
            </Box>
          </Collapse>
        </>
      )}
    </Card>
  );
};
export default StepBundleCard;
