import { useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
  Input,
  Select,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { checkIsConditionsUsed } from './TriggersPage.utils';

import { FormItems, TriggerItem } from './TriggersPage.types';

type DialogProps = {
  currentTriggers: TriggerItem[];
  isOpen: boolean;
  onClose: () => void;
  editedItem?: TriggerItem;
  pipelines: string[];
  onSubmit: (action: 'add' | 'edit', trigger: TriggerItem) => void;
  workflows: string[];
};

const AddTagTriggerDialog = (props: DialogProps) => {
  const { currentTriggers, isOpen, onClose, editedItem, pipelines, onSubmit, workflows } = props;

  const defaultValues: FormItems = useMemo(() => {
    return {
      conditions: [
        {
          isRegex: false,
          type: 'tag',
          value: '',
        },
      ],
      id: crypto.randomUUID(),
      pipelineable: '',
      source: 'tag',
      isActive: true,
      ...editedItem,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedItem, isOpen]);

  const formMethods = useForm<FormItems>({
    defaultValues,
  });

  const { register, reset, handleSubmit, watch } = formMethods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen, editedItem]);

  const conditionNumber: number = 0;

  const { pipelineable } = watch();

  const isEditMode = !!editedItem;

  const onFormSubmit = (data: FormItems) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = '*';
      }
      return newCondition;
    });
    onSubmit(isEditMode ? 'edit' : 'add', filteredData as TriggerItem);
    onFormCancel();
  };

  const onFormCancel = () => {
    onClose();
    reset(defaultValues);
  };

  const isPipelineableMissing = !pipelineable;

  const isConditionsUsed = checkIsConditionsUsed(currentTriggers, watch() as TriggerItem);

  const isSubmitDisabled = isPipelineableMissing || isConditionsUsed;

  let submitTooltipLabel = 'Please select a pipeline or workflow.';
  if (isConditionsUsed) {
    submitTooltipLabel = 'You previously added this tag for another trigger. Please check and try again.';
  }

  return (
    <FormProvider {...formMethods}>
      <Dialog
        title={isEditMode ? 'Edit trigger' : 'Add tag trigger'}
        as="form"
        maxWidth="480"
        isOpen={isOpen}
        onClose={onFormCancel}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          <Text marginBottom="4" textStyle="heading/h3">
            Set up trigger
          </Text>
          <Text marginBottom="24" color="text/secondary">
            Define a tag and select a Pipeline or Workflow for execution on Bitrise whenever the tag is pushed to your
            repository.
          </Text>
          <Text color="text/secondary" marginBottom="16">
            <Text as="span" textStyle="body/md/semibold" color="input/text/label">
              Tag{' '}
            </Text>
            (optional)
          </Text>
          <Checkbox marginBottom="8" {...register(`conditions.${conditionNumber}.isRegex`)}>
            Use regex pattern
          </Checkbox>
          <Tooltip label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text.">
            <Icon name="Info" size="16" marginLeft="5" />
          </Tooltip>
          <Controller
            name={`conditions.${conditionNumber}.value`}
            render={({ field }) => (
              <Input
                marginBottom="24"
                {...field}
                onChange={(e) => field.onChange(e.target.value.trimStart())}
                placeholder="*"
                helperText="If you leave it blank, Bitrise will mark it as a * and start builds for any tag."
              />
            )}
          />
          <Text color="text/primary" textStyle="body/md/semibold" marginBottom="4">
            Targeted Pipeline or Workflow
          </Text>
          <Select placeholder="Select a Pipeline or Workflow" {...register('pipelineable')}>
            {pipelines.length && (
              <optgroup label="Pipelines">
                {pipelines.map((p) => (
                  <option key={p} value={`pipeline#${p}`}>
                    {p}
                  </option>
                ))}
              </optgroup>
            )}
            {workflows.length && (
              <optgroup label="Workflows">
                {workflows.map((p) => (
                  <option key={p} value={`workflow#${p}`}>
                    {p}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
        </DialogBody>
        <DialogFooter display="flex" justifyContent="space-between">
          <Button variant="tertiary" onClick={onFormCancel}>
            Cancel
          </Button>
          <Tooltip isDisabled={!isSubmitDisabled} label={submitTooltipLabel}>
            <Button type="submit" isDisabled={isSubmitDisabled}>
              {isEditMode ? 'Done' : 'Add trigger'}
            </Button>
          </Tooltip>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default AddTagTriggerDialog;
