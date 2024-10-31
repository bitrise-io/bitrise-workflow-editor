import { Box, Button, Dialog, DialogBody, DialogFooter, DialogProps, Input, Select } from '@bitrise/bitkit';
import { useForm } from 'react-hook-form';
import PipelineService from '@/core/models/PipelineService';
import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = Omit<DialogProps, 'title'> & {
  onCreatePipeline: (pipelineId: string, basePipelineId?: string) => void;
};

const CreatePipelineDialog = ({ onCreatePipeline, onClose, onCloseComplete, ...props }: Props) => {
  const { keys: pipelineIds, onSelectPipeline: setSelectedPipeline } = usePipelineSelector();

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      pipelineId: '',
      basePipelineId: '',
    },
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('pipelineId', PipelineService.sanitizeName(event.target.value), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
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
    onCloseComplete?.();
  };

  return (
    <Dialog {...props} title="Create Pipeline" onClose={onClose} onCloseComplete={handleCloseComplete}>
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
          <Select isRequired label="Based on" {...register('basePipelineId')}>
            <option key="" value="">
              An empty pipeline
            </option>
            {pipelineIds.map((pipelineId) => (
              <option key={pipelineId} value={pipelineId}>
                {pipelineId}
              </option>
            ))}
          </Select>
        </Box>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleCreate} isDisabled={!(isDirty && isValid)}>
          Create Pipeline
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreatePipelineDialog;
