import '@xyflow/react/dist/style.css';

import { Box } from '@bitrise/bitkit';
import { useEffect, useMemo } from 'react';

import { getBitriseYml } from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import useCloseDialogsOnFileSwitch, { FileSwitchDialogRefs } from '@/hooks/useCloseDialogsOnFileSwitch';

import Drawers from './components/Drawers/Drawers';
import CreateFirstGraphPipelineEmptyState from './components/EmptyStates/CreateFirstGraphPipelineEmptyState';
import ReactivatePlanEmptyState from './components/EmptyStates/ReactivatePlanEmptyState';
import UpgradePlanEmptyState from './components/EmptyStates/UpgradePlanEmptyState';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import usePipelineSelector from './hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from './PipelinesPage.store';

const STEP_INDEX_DIALOGS = [PipelinesPageDialogType.STEP_CONFIG, PipelinesPageDialogType.STEP_BUNDLE];

function fileSwitchDialogRefs(): FileSwitchDialogRefs | null {
  const { openedDialogType, pipelineId, workflowId, parentWorkflowId, stepBundleId, selectedStepIndices } =
    usePipelinesPageStore.getState();

  if (openedDialogType === PipelinesPageDialogType.NONE) {
    return null;
  }

  // Graph-pipeline nodes can be aliases (`uses:`) that don't exist as top-level
  // workflows — validate the underlying workflow instead.
  const resolveWorkflowAlias = (id: string) => {
    if (!id || !pipelineId) {
      return id;
    }
    return getBitriseYml().pipelines?.[pipelineId]?.workflows?.[id]?.uses ?? id;
  };

  return {
    pipelineIds: [pipelineId],
    workflowIds: [resolveWorkflowAlias(workflowId), resolveWorkflowAlias(parentWorkflowId)],
    stepBundleIds: [stepBundleId],
    steps: STEP_INDEX_DIALOGS.includes(openedDialogType)
      ? {
          source: stepBundleId ? 'step_bundles' : 'workflows',
          sourceId: stepBundleId || resolveWorkflowAlias(workflowId),
          indices: selectedStepIndices,
        }
      : undefined,
  };
}

const PipelinesPage = () => {
  const { keys } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);

  useEffect(() => {
    return () => closeDialog();
  }, [closeDialog]);

  useCloseDialogsOnFileSwitch(fileSwitchDialogRefs, () => {
    const { closeDialog: close, setSelectedStepIndices } = usePipelinesPageStore.getState();
    close();
    setSelectedStepIndices();
  });

  const hasPipelines = keys.length > 0;
  const canAccessPipelines = PageProps.limits()?.isPipelinesAvailable;

  const upgradePlan = () => {
    window.location.assign(`/workspaces/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`);
  };

  const content = useMemo(() => {
    if (canAccessPipelines === false) {
      if (hasPipelines) {
        return <ReactivatePlanEmptyState onReactivate={canAccessPipelines === false ? upgradePlan : undefined} />;
      }

      return <UpgradePlanEmptyState onUpgrade={canAccessPipelines === false ? upgradePlan : undefined} />;
    }

    if (hasPipelines) {
      return <PipelineCanvas />;
    }

    return (
      <CreateFirstGraphPipelineEmptyState onCreate={openDialog({ type: PipelinesPageDialogType.CREATE_PIPELINE })} />
    );
  }, [canAccessPipelines, hasPipelines, openDialog]);

  return (
    <Box display="flex" flexDir="column" h="100%">
      {content}
      <Drawers />
    </Box>
  );
};

export default PipelinesPage;
