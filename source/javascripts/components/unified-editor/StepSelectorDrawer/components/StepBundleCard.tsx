import { useMemo, useRef } from 'react';
import { Box, ButtonGroup, Card, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { StepCardProps } from '@/components/unified-editor/WorkflowCard/components/StepCard';
import { LibraryType } from '@/core/models/Step';
import StepBundleStepList from '../../WorkflowCard/components/StepBundleStepList';

type StepBundleCardProps = StepCardProps & {
  cvs: string;
  isCollapsable?: boolean;
};

const StepBundleCard = (props: StepBundleCardProps) => {
  const { cvs, isCollapsable, isDragging, stepIndex, workflowId } = props;

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isCollapsable });
  const containerRef = useRef(null);
  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });
  const { onDeleteStep, onSelectStep } = useStepActions();

  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

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
    <Card borderRadius="8" variant="elevated" minW={0}>
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
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
      <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
        <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
          <StepBundleStepList stepBundleId={cvs.replace('bundle::', '')} />
        </Box>
      </Collapse>
    </Card>
  );
};
export default StepBundleCard;
