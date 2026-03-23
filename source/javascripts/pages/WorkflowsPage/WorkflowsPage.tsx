import { Box } from '@bitrise/bitkit';
import { useEffect } from 'react';

import WorkflowConfigPanel from '@/components/unified-editor/WorkflowConfig/WorkflowConfigPanel';
import WorkflowEmptyState from '@/components/unified-editor/WorkflowEmptyState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import WindowUtils from '@/core/utils/WindowUtils';
import useParentMessageListener from '@/hooks/useParentMessageListener';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

import Drawers from './components/Drawers/Drawers';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from './WorkflowsPage.store';

const WorkflowsPage = () => {
  const [selectedWorkflowId] = useSelectedWorkflow();
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);

  // If ciConfigExpert is enabled by workspace
  const isAIButtonVisible =
    PageProps.settings()?.ai.ciConfigExpert && PageProps.settings()?.ai.ciConfigExpert.disabled !== 'by-workspace';

  // If ciConfigExpert is enabled by project
  const isAIButtonDisabled = isAIButtonVisible && PageProps.settings()?.ai.ciConfigExpert.disabled === 'by-project';

  const handleCreateWorkflowWithAI = () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      action: 'create',
      bitriseYmlContents: getYmlString(),
      selectedPage: 'workflows',
      yamlSelector: 'workflow',
    });
  };

  useParentMessageListener<{ bitriseYmlContents: string }>('CI_CONFIG_RECEIVED', (payload) => {
    updateBitriseYmlDocumentByString(payload.bitriseYmlContents);
  });

  useParentMessageListener('REQUEST_AI_DRAWER_OPEN', () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      bitriseYmlContents: getYmlString(),
      selectedPage: 'workflows',
    });
  });

  useEffect(() => {
    closeDialog();
  }, [selectedWorkflowId, closeDialog]);

  if (!selectedWorkflowId) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState
          isAIButtonDisabled={isAIButtonDisabled}
          onCreateWorkflow={openDialog({
            type: WorkflowsPageDialogType.CREATE_WORKFLOW,
          })}
          onCreateWorkflowWithAI={isAIButtonVisible ? handleCreateWorkflowWithAI : undefined}
        />
        <Drawers />
      </Box>
    );
  }

  return (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <WorkflowCanvasPanel workflowId={selectedWorkflowId} />
      <WorkflowConfigPanel workflowId={selectedWorkflowId} />
      <Drawers />
    </Box>
  );
};

export default WorkflowsPage;
