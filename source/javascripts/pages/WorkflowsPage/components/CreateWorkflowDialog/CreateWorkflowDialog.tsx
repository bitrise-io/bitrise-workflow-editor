import { Box, Button, Dialog, DialogBody, DialogFooter, Input, Select, useDisclosure } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import { UseDisclosureProps } from '@chakra-ui/react';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';

type FormValues = {
  workflowId: string;
  baseWorkflowId: string;
};

type Props = UseDisclosureProps & {
  onCreateWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
};

const CreateWorkflowDialog = ({ onCreateWorkflow, ...disclosureProps }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const { isOpen, onClose } = useDisclosure(disclosureProps);

  const {
    reset,
    register,
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
    onCreateWorkflow(workflowId, baseWorkflowId);
    onClose();
  });

  const handleCloseComplete = () => {
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
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            errorText={errors.workflowId?.message}
            {...register('workflowId', {
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

// TODO: Remove this after the whole page gets the BitriseYmlProvider
const CreateWorkflowDialogWrapper = ({ yml, ...props }: Props & { yml: BitriseYml }) => {
  return (
    <BitriseYmlProvider yml={yml}>
      <CreateWorkflowDialog {...props} />
    </BitriseYmlProvider>
  );
};

export default CreateWorkflowDialogWrapper;
