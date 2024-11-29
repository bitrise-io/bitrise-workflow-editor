import { DialogProps } from '@bitrise/bitkit';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';

type Props = Omit<DialogProps, 'title'> & {
  onCreateWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onClose, onCloseComplete, onCreateWorkflow, ...props }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const [, setSelectedWorkflow] = useSelectedWorkflow();

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
      onCreateEntity={onCreateWorkflow}
      sanitizer={WorkflowService.sanitizeName}
      validator={(v) => WorkflowService.validateName(v, workflowIds)}
      {...props}
    />
  );
};

export default CreateWorkflowDialog;
