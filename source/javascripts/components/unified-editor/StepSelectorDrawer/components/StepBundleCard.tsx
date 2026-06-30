import { Box, Card, CardProps, Collapse, ControlButton, Dot, Icon, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MouseEvent, useMemo, useRef, useState } from 'react';

import { crossFileProvenanceLabel } from '@/components/CrossFileProvenanceText';
import DragHandle from '@/components/DragHandle/DragHandle';
import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import useContainerReferences from '@/components/unified-editor/ContainersTab/hooks/useContainerReferences';
import StepMenu from '@/components/unified-editor/WorkflowCard/components/StepMenu';
import { ContainerType } from '@/core/models/Container';
import { LibraryType } from '@/core/models/Step';
import StepBundleService from '@/core/services/StepBundleService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import useStepBundle from '@/hooks/useStepBundle';
import { useCrossFileEntity, useIsMergedConfigSelected, useIsReadOnlyView } from '@/hooks/useTree';

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

  // Cross-file: bundle definition lives in another module — a subtle tint signals it.
  const bundleId = StepBundleService.cvsToId(cvs);
  const { isCrossFile, hasDefinition, definingPaths } = useCrossFileEntity('stepBundles', bundleId);
  const isReadOnlyView = useIsReadOnlyView();
  const isMergedView = useIsMergedConfigSelected();
  // In the merged view every bundle resolves locally, but its definition still lives in a module — offer a jump.
  const showJumpButton = isCrossFile || (isMergedView && hasDefinition);
  // Ghosts (cross-file refs or read-only view) get a lighter border/minimal instead of the tint.
  const isGhost = isCrossFile || isReadOnlyView;
  const { isSelected } = useSelection();
  const { onDeleteStep, onDeleteStepInStepBundle, onSelectStep } = useStepActions();
  const zoom = useReactFlowZoom();
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  const stepBundleInstance = useStepBundle({
    stepBundleId: workflowId || stepBundleId ? undefined : StepBundleService.cvsToId(cvs),
    parentWorkflowId: workflowId,
    parentStepBundleId: stepBundleId,
    stepIndex,
  });

  const { definition, instance } = useContainerReferences({
    source: stepBundleId ? 'step_bundles' : 'workflows',
    sourceId: stepBundleId || workflowId || '',
    stepIndex,
    isEnabled: !!stepBundleInstance.stepBundle,
    stepBundleId: StepBundleService.cvsToId(cvs),
  });

  const executionReferences = instance?.[ContainerType.Execution] ?? definition?.[ContainerType.Execution] ?? [];
  const serviceReferences = [
    ...(instance?.[ContainerType.Service] || []),
    ...(definition?.[ContainerType.Service] || []),
  ];
  const referenceIds = [...executionReferences, ...serviceReferences].map((ref) => ref.id).join(', ');

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      cvs,
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

  let cardPadding;
  if (isCollapsable) {
    if (!isPreviewMode) {
      cardPadding = '6px 8px 6px 0px';
    }
  } else {
    cardPadding = '4px 8px';
  }

  const [isJumpPopoverOpen, setIsJumpPopoverOpen] = useState(false);

  const isHighlighted = isSelected({ workflowId, stepBundleId, stepIndex });
  const isPlaceholder = sortable.isDragging;
  const isButton = onSelectStep && (workflowId || stepBundleId);

  const handleClick = isButton
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
      // A step bundle is a step-level item inside a workflow, so the ghost look is just a lighter
      // border/minimal — no shadow (unlike the node cards, which use minElevated).
      ...(isGhost ? { borderColor: 'border/minimal' } : {}),
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

    return {
      ...common,
      ...(isHighlighted ? { outline: '2px solid', outlineColor: 'border/selected' } : {}),
    };
  }, [isCollapsable, isDragging, isHighlighted, isPlaceholder, isGhost]);

  const buttonGroup = useMemo(() => {
    // The menu's actions come from onDeleteStep OR onDeleteStepInStepBundle (the latter for
    // step bundles nested inside step bundles, e.g. the StepBundles page) — gate on both so
    // read-only (which strips them) hides the menu without hiding it for nested bundles.
    if ((!workflowId && !stepBundleId) || isDragging || (!onDeleteStep && !onDeleteStepInStepBundle)) {
      return null;
    }

    return (
      <StepMenu
        isHighlighted={isHighlighted}
        forceVisible={isJumpPopoverOpen}
        stepBundleId={stepBundleId}
        stepIndex={stepIndex}
        workflowId={workflowId}
      />
    );
  }, [
    isDragging,
    isHighlighted,
    isJumpPopoverOpen,
    onDeleteStep,
    onDeleteStepInStepBundle,
    stepBundleId,
    stepIndex,
    workflowId,
  ]);

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
              {/* No expand/collapse for cross-file refs — their nested steps live in another file. */}
              {isCollapsable && !isCrossFile && (
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
                <Box display="flex" alignItems="center" gap="4">
                  <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
                    {isCrossFile ? crossFileProvenanceLabel(definingPaths) : usedInWorkflowsText}
                  </Text>
                  {referenceIds.length > 0 && (
                    <>
                      <Dot backgroundColor="icon/tertiary" size="4" mx="6"></Dot>
                      <Icon name="Container" size="16" color="icon/tertiary" />
                      <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
                        {referenceIds}
                      </Text>
                    </>
                  )}
                </Box>
              </Box>
              {showJumpButton && (
                <Box display={isJumpPopoverOpen ? 'flex' : 'none'} _groupHover={{ display: 'flex' }}>
                  <CrossFileJumpButton kind="stepBundles" id={bundleId} onOpenChange={setIsJumpPopoverOpen} />
                </Box>
              )}
              {buttonGroup}
            </Box>
          </Box>
          {!isCrossFile && (
            <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
              <Box p="8" ref={containerRef}>
                <StepBundleStepList stepBundleId={StepBundleService.cvsToId(cvs)} />
              </Box>
            </Collapse>
          )}
        </>
      )}
    </Card>
  );
};

export default StepBundleCard;
