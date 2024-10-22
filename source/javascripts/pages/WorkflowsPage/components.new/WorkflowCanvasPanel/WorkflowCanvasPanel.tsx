import { Box, IconButton } from '@bitrise/bitkit';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { StepActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';

type Props = {
  workflowId: string;
};

const WorkflowCanvasPanel = ({ workflowId }: Props) => {
  const { moveStep, upgradeStep, cloneStep, deleteStep, setChainedWorkflows, deleteChainedWorkflow } =
    useBitriseYmlStore((s) => ({
      moveStep: s.moveStep,
      setChainedWorkflows: s.setChainedWorkflows,
      deleteChainedWorkflow: s.deleteChainedWorkflow,
      upgradeStep: s.changeStepVersion,
      cloneStep: s.cloneStep,
      deleteStep: s.deleteStep,
    }));

  const {
    openStepConfigDrawer,
    openWithGroupConfigDrawer,
    openStepBundleDrawer,
    openStepSelectorDrawer,
    openRunWorkflowDialog,
    openChainWorkflowDialog,
    openWorkflowConfigDrawer,
  } = useWorkflowsPageStore();

  const openStepLikeDrawer: StepActions['onStepSelect'] = (wfId, stepIndex, libraryType) => {
    switch (libraryType) {
      case LibraryType.WITH:
        openWithGroupConfigDrawer(wfId, stepIndex);
        break;
      case LibraryType.BUNDLE:
        openStepBundleDrawer(wfId, stepIndex);
        break;
      default:
        openStepConfigDrawer(wfId, stepIndex);
        break;
    }
  };

  return (
    <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
      <Box p="12" display="flex" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
        <WorkflowSelector />
        {RuntimeUtils.isWebsiteMode() && (
          <IconButton
            size="md"
            iconName="Play"
            variant="secondary"
            aria-label={
              WorkflowService.isUtilityWorkflow(workflowId) ? "Utility workflows can't be run" : 'Run Workflow'
            }
            tooltipProps={{
              'aria-label': WorkflowService.isUtilityWorkflow(workflowId)
                ? "Utility workflows can't be run"
                : 'Run Workflow',
            }}
            isDisabled={WorkflowService.isUtilityWorkflow(workflowId)}
            onClick={() => openRunWorkflowDialog(workflowId)}
          />
        )}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <WorkflowCard
          id={workflowId}
          workflowActions={{
            onEditWorkflowClick: openWorkflowConfigDrawer,
            onChainedWorkflowsUpdate: setChainedWorkflows,
            onAddChainedWorkflowClick: openChainWorkflowDialog,
            onDeleteChainedWorkflowClick: deleteChainedWorkflow,
          }}
          stepActions={{
            onStepMove: moveStep,
            onStepSelect: openStepLikeDrawer,
            onAddStepClick: openStepSelectorDrawer,
            onUpgradeStep: upgradeStep,
            onCloneStep: cloneStep,
            onDeleteStep: deleteStep,
          }}
          containerProps={{ maxW: 400, marginX: 'auto' }}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
