import { useEffect } from 'react';
import { DialogProps } from '@bitrise/bitkit';

import { trackWorkflowCreated, trackWorkflowDialogShown } from '@/core/analytics/WorkflowAnalytics';
import WorkflowService from '@/core/services/WorkflowService';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';

import CreateEntityDialog from '../CreateEntityDialog/CreateEntityDialog';

type Props = Omit<DialogProps, 'title'> & {
  onCreateWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onClose, onCloseComplete, onCreateWorkflow, ...props }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const [, setSelectedWorkflow] = useSelectedWorkflow();

  useEffect(() => {
    trackWorkflowDialogShown(workflowIds.length ? 'workflow_selector' : 'workflow_empty_state');
  }, [workflowIds.length]);

  const handleCreateWorkflow = (workflowId: string, baseWorkflowId?: string) => {
    onCreateWorkflow(workflowId, baseWorkflowId);
    trackWorkflowCreated(workflowId, baseWorkflowId);
  };

  const handleCloseComplete = (workflowId: string) => {
    if (workflowId) {
      setSelectedWorkflow(workflowId);
    }
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      baseEntityIds={workflowIds}
      entityName="Workflow"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={handleCreateWorkflow}
      sanitizer={WorkflowService.sanitizeName}
      validator={(v) => WorkflowService.validateName(v, workflowIds)}
      {...props}
    />
  );
};

export default CreateWorkflowDialog;
