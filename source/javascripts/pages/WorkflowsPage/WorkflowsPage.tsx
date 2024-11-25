import { Box } from '@bitrise/bitkit';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import {
  ChainWorkflowDrawer,
  CreateWorkflowDialog,
  StartBuildDialog,
  StepBundleDrawer,
  StepConfigDrawer,
  StepSelectorDrawer,
  WithGroupDrawer,
  WorkflowConfigDrawer,
  WorkflowConfigPanel,
  WorkflowEmptyState,
} from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import StepService from '@/core/models/StepService';
import { BITRISE_STEP_LIBRARY_URL } from '@/core/models/Step';
import { useWorkflowsPageStore } from './WorkflowsPage.store';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPageContent = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const {
    workflowId,
    stepIndex,
    isDialogOpen,
    dialogMounted,
    closeDialog,
    openStepConfigDrawer,
    unmountStepConfigDrawer,
    openCreateWorkflowDialog,
    openWorkflowConfigDrawer,
    unmountWorkflowConfigDrawer,
  } = useWorkflowsPageStore();

  const { addStep, createWorkflow, getUniqueStepIds, addChainedWorkflow } = useBitriseYmlStore((s) => ({
    addStep: s.addStep,
    createWorkflow: s.createWorkflow,
    deleteWorkflow: s.deleteWorkflow,
    getUniqueStepIds: s.getUniqueStepIds,
    addChainedWorkflow: s.addChainedWorkflow,
  }));

  const {
    enabledSteps,
    isRunWorkflowDialogOpen,
    isStepConfigDrawerOpen,
    isStepConfigDrawerMounted,
    isStepSelectorDrawerOpen,
    isWithBlockDrawerOpen,
    isStepBundleDrawerOpen,
    isChainWorkflowDrawerOpen,
    isCreateWorkflowDialogOpen,
    isWorkflowConfigDrawerOpen,
    isWorkflowConfigDrawerMounted,
  } = {
    enabledSteps: new Set(getUniqueStepIds()),
    isRunWorkflowDialogOpen: isDialogOpen === 'run-workflow',
    isStepConfigDrawerOpen: isDialogOpen === 'step-config-drawer',
    isStepConfigDrawerMounted: dialogMounted['step-config-drawer'],
    isStepSelectorDrawerOpen: isDialogOpen === 'step-selector-drawer',
    isWithBlockDrawerOpen: isDialogOpen === 'with-group-drawer',
    isStepBundleDrawerOpen: isDialogOpen === 'step-bundle-drawer',
    isChainWorkflowDrawerOpen: isDialogOpen === 'chain-workflow',
    isCreateWorkflowDialogOpen: isDialogOpen === 'create-workflow',
    isWorkflowConfigDrawerOpen: isDialogOpen === 'workflow-config-drawer',
    isWorkflowConfigDrawerMounted: dialogMounted['workflow-config-drawer'],
  };

  const handleAddStep = (cvs: string) => {
    const { id, version } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    const cvsWithLatestMajorVersion = `${id}@${version.split('.')[0]}`;
    addStep(workflowId, cvsWithLatestMajorVersion, stepIndex);
    openStepConfigDrawer(workflowId, stepIndex);
  };

  if (!selectedWorkflowId) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState onCreateWorkflow={openCreateWorkflowDialog} />
        <CreateWorkflowDialog
          isOpen={isCreateWorkflowDialogOpen}
          onClose={closeDialog}
          onCreateWorkflow={createWorkflow}
        />
      </Box>
    );
  }

  return (
    <>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel workflowId={selectedWorkflowId} />
        <WorkflowConfigPanel workflowId={selectedWorkflowId} />
      </Box>

      <StartBuildDialog workflowId={workflowId} isOpen={isRunWorkflowDialogOpen} onClose={closeDialog} />

      <CreateWorkflowDialog
        isOpen={isCreateWorkflowDialogOpen}
        onClose={closeDialog}
        onCreateWorkflow={createWorkflow}
      />

      <ChainWorkflowDrawer
        workflowId={workflowId}
        isOpen={isChainWorkflowDrawerOpen}
        onClose={closeDialog}
        onChainWorkflow={addChainedWorkflow}
      />

      {isStepConfigDrawerMounted && (
        <StepConfigDrawer
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isStepConfigDrawerOpen}
          onClose={closeDialog}
          onCloseComplete={unmountStepConfigDrawer}
        />
      )}

      <WithGroupDrawer
        isOpen={isWithBlockDrawerOpen}
        onClose={closeDialog}
        workflowId={workflowId}
        stepIndex={stepIndex}
      />

      <StepBundleDrawer
        isOpen={isStepBundleDrawerOpen}
        onClose={closeDialog}
        workflowId={workflowId}
        stepIndex={stepIndex}
      />

      <StepSelectorDrawer
        enabledSteps={enabledSteps}
        isOpen={isStepSelectorDrawerOpen}
        onClose={closeDialog}
        onSelectStep={({ cvs }) => handleAddStep(cvs)}
      />

      {isWorkflowConfigDrawerMounted && (
        <WorkflowConfigDrawer
          context="workflow"
          workflowId={workflowId}
          onRename={openWorkflowConfigDrawer}
          isOpen={isWorkflowConfigDrawerOpen}
          onClose={closeDialog}
          onCloseComplete={unmountWorkflowConfigDrawer}
        />
      )}
    </>
  );
};

const WorkflowsPage = ({ yml, onChange }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <WorkflowsPageContent />
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
