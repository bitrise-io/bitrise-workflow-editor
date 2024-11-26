import { Box, Button, Dialog, DialogBody, DialogFooter, DialogProps, Input, Select } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';

type FormValues = {
  workflowId: string;
  baseWorkflowId: string;
};

type Props = Omit<DialogProps, 'title'> & {
  onCreateWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onClose, onCloseComplete, onCreateWorkflow, ...props }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const [, setSelectedWorkflow] = useSelectedWorkflow();

  const {
    reset,
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      workflowId: '',
      baseWorkflowId: '',
    },
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = WorkflowService.sanitizeName(event.target.value);
    setValue('workflowId', filteredValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleCreate = handleSubmit(({ workflowId, baseWorkflowId }) => {
    onCreateWorkflow(workflowId, baseWorkflowId);
    onClose();
  });

  const handleCloseComplete = () => {
    const workflowId = getValues('workflowId');
    if (workflowId) {
      setSelectedWorkflow(workflowId);
    }
    reset();
    onCloseComplete?.();
  };

  return (
    <Dialog title="Create Workflow" onClose={onClose} onCloseComplete={handleCloseComplete} {...props}>
      <DialogBody>
        <Box as="form" display="flex" flexDir="column" gap="24">
          <Input
            autoFocus
            isRequired
            label="Name"
            placeholder="Workflow name"
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            errorText={errors.workflowId?.message}
            {...register('workflowId', {
              onChange: handleNameChange,
              validate: (v) => WorkflowService.validateName(v, workflowIds),
            })}
          />
          <Select isRequired defaultValue="" label="Based on" {...register('baseWorkflowId')}>
            <option key="" value="">
              An empty workflow
            </option>
            {workflowIds.map((wfName) => (
              <option key={wfName} value={wfName}>
                {wfName}
              </option>
            ))}
          </Select>
        </Box>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleCreate}>
          Create Workflow
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateWorkflowDialog;
