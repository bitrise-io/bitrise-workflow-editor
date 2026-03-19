import { Box } from '@bitrise/bitkit';
import { useEffect } from 'react';

import WorkflowConfigPanel from '@/components/unified-editor/WorkflowConfig/WorkflowConfigPanel';
import WorkflowEmptyState from '@/components/unified-editor/WorkflowEmptyState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { usePostMessage } from '@/hooks/usePostMessage';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

import Drawers from './components/Drawers/Drawers';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from './WorkflowsPage.store';

export const CI_CONFIG_EXPERT_CHANNEL = 'ci-config-expert';

export type EntityType = 'workflow' | 'pipeline';

// Iframe → Parent (inbound)
export type InboundMessage =
  | { type: 'create'; payload: { ciConfig: string; entityType: EntityType } }
  | { type: 'explain'; payload: { ciConfig: string; entityId: string; entityType: EntityType } }
  | { type: 'close-expert' };

// Parent → Iframe (outbound)
export type OutboundMessage = { type: 'apply-config'; payload: { ciConfig: string } };

const WorkflowsPage = () => {
  const [selectedWorkflowId] = useSelectedWorkflow();
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);

  const { data, post, timeStamp } = usePostMessage<OutboundMessage, InboundMessage>({
    channel: CI_CONFIG_EXPERT_CHANNEL,
  });

  const handleCreateWorkflowWithAI = () => {
    post({ type: 'create', payload: { ciConfig: getYmlString(), entityType: 'workflow' } });
  };

  useEffect(() => {
    if (data?.type === 'apply-config') {
      updateBitriseYmlDocumentByString(data.payload.ciConfig);
    }
  }, [data, timeStamp]);

  useEffect(() => {
    closeDialog();
  }, [selectedWorkflowId, closeDialog]);

  if (!selectedWorkflowId) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState
          onCreateWorkflow={openDialog({
            type: WorkflowsPageDialogType.CREATE_WORKFLOW,
          })}
          onCreateWorkflowWithAI={handleCreateWorkflowWithAI}
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
