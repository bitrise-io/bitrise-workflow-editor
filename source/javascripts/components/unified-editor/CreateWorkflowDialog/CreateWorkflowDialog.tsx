import { DialogProps } from '@bitrise/bitkit';
import { useEffect } from 'react';

import { trackCreateWorkflowDialogShown, trackWorkflowCreated } from '@/core/analytics/WorkflowAnalytics';
import WorkflowService from '@/core/services/WorkflowService';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';

import CreateEntityDialog from '../CreateEntityDialog/CreateEntityDialog';

type Props = Omit<DialogProps, 'title'> & {
  onCreateWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onClose, onCloseComplete, onCreateWorkflow, ...props }: Props) => {
  const workflowIds = useWorkflows((s) => Object.keys(s));
  const [, setSelectedWorkflow] = useSelectedWorkflow();

  useEffect(() => {
    if (props.isOpen) {
      trackCreateWorkflowDialogShown(workflowIds.length ? 'workflow_selector' : 'workflow_empty_state');
    }
  }, [props.isOpen, workflowIds.length]);

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
      baseEntities={[{ ids: workflowIds }]}
      entityName="Workflow"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={handleCreateWorkflow}
      sanitizer={WorkflowService.sanitizeName}
      validator={(name) => WorkflowService.validateName(name, '', workflowIds)}
      {...props}
    />
  );
};

export default CreateWorkflowDialog;
