import { Box, Button, Dialog, DialogBody, DialogFooter, Input, Select, useDisclosure } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import { UseDisclosureProps } from '@chakra-ui/react';
import PipelineService from '@/core/models/PipelineService';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type FormValues = {
  pipelineId: string;
  basePipelineId: string;
};

type Props = UseDisclosureProps & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, ...disclosureProps }: Props) => {
  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();
  const { isOpen, onClose } = useDisclosure(disclosureProps);

  const {
    reset,
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      pipelineId: '',
      basePipelineId: '',
    },
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = PipelineService.sanitizeName(event.target.value);
    setValue('pipelineId', filteredValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleCreate = handleSubmit(({ pipelineId, basePipelineId }) => {
    onCreatePipeline(pipelineId, basePipelineId);
    onClose();
  });

  const handleCloseComplete = () => {
    const pipelineId = getValues('pipelineId');
    if (pipelineId) {
      setSelectedPipeline(pipelineId);
    }
    reset();
  };

  return (
    <Dialog title="Create Pipeline" isOpen={isOpen} onClose={handleClose} onCloseComplete={handleCloseComplete}>
      <DialogBody>
        <Box as="form" display="flex" flexDir="column" gap="24">
          <Input
            autoFocus
            isRequired
            label="Name"
            placeholder="Pipeline name"
            inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
            errorText={errors.pipelineId?.message}
            {...register('pipelineId', {
              onChange: handleNameChange,
              validate: (v) => PipelineService.validateName(v, pipelineIds),
            })}
          />
          <Select isRequired defaultValue="" label="Based on" {...register('basePipelineId')}>
            <option key="" value="">
              An empty pipeline
            </option>
            {pipelineIds.map((wfName) => (
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
          Create Pipeline
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreatePipelineDialog;
