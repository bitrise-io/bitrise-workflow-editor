import { useMemo, useRef } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { StepCardProps } from '@/components/unified-editor/WorkflowCard/components/StepCard';
import { LibraryType } from '@/core/models/Step';
import DragHandle from '@/components/DragHandle/DragHandle';
import { SortableStepItem } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import useReactFlowZoom from '@/components/unified-editor/WorkflowCard/hooks/useReactFlowZoom';
import StepBundleStepList from '../../WorkflowCard/components/StepBundleStepList';

type StepBundleCardProps = StepCardProps & {
  cvs: string;
  isCollapsable?: boolean;
  isPreviewMode?: boolean;
};

const StepBundleCard = (props: StepBundleCardProps) => {
  const { cvs, isCollapsable, isDragging, isPreviewMode, isSortable, stepBundleId, stepIndex, uniqueId, workflowId } =
    props;

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isCollapsable });
  const containerRef = useRef(null);
  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });
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

    return common;
  }, [isDragging, isPlaceholder]);

  const buttonGroup = useMemo(() => {
    if (!workflowId || isDragging || (!onDeleteStep && !onSelectStep)) {
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
              onSelectStep(workflowId, stepIndex, LibraryType.BUNDLE);
            }}
          />
        )}
        {onDeleteStep && (
          <ControlButton
            iconName="Trash"
            aria-label="Remove Step bundle"
            size="xs"
            isDanger
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStep(workflowId, stepIndex);
            }}
          />
        )}
      </ButtonGroup>
    );
  }, [isDragging, onDeleteStep, onSelectStep, stepIndex, workflowId]);

  return (
    <Card {...cardProps} minW={0} style={style} ref={sortable.setNodeRef}>
      {!isPlaceholder && (
        <>
          <Box display="flex">
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
              <StepBundleStepList stepBundleId={cvs.replace('bundle::', '')} isPreviewMode={isPreviewMode} />
            </Box>
          </Collapse>
        </>
      )}
    </Card>
  );
};
export default StepBundleCard;
