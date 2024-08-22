import { Box, Button, Dialog, DialogBody, DialogFooter, Input, Select, useDisclosure } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import { UseDisclosureProps } from '@chakra-ui/react';
import { isNotEmpty, isUnique, WORKFLOW_NAME_PATTERN, WORKFLOW_NAME_REQUIRED } from '@/models/Workflow';
import useWorkflowIds from '../../hooks/useWorkflowIds';
import useSelectedWorkflow from '../../hooks/useSelectedWorkflow';

type FormValues = {
  workflowId: string;
  baseWorkflowId: string;
};

type Props = UseDisclosureProps & {
  onCreate: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onCreate, ...disclosureProps }: Props) => {
  const workflowIds = useWorkflowIds();
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const { isOpen, onClose } = useDisclosure(disclosureProps);

  const {
    reset,
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      workflowId: '',
      baseWorkflowId: '',
    },
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleCreate = handleSubmit(({ workflowId, baseWorkflowId }) => {
    onCreate(workflowId, baseWorkflowId);
    onClose();
  });

  const handleCloseComplete = () => {
    const workflowId = getValues('workflowId');
    if (workflowId) {
      setSelectedWorkflow(workflowId);
    }
    reset();
  };

  return (
    <Dialog title="Create Workflow" isOpen={isOpen} onClose={handleClose} onCloseComplete={handleCloseComplete}>
      <DialogBody>
        <Box as="form" display="flex" flexDir="column" gap="24">
          <Input
            autoFocus
            isRequired
            label="Name"
            placeholder="Workflow name"
            errorText={errors.workflowId?.message}
            {...register('workflowId', {
              required: WORKFLOW_NAME_REQUIRED,
              pattern: WORKFLOW_NAME_PATTERN,
              validate: { isUnique: isUnique(workflowIds), isNotEmpty },
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
        <Button variant="secondary" onClick={handleClose}>
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
