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
import { FormProvider, useForm } from 'react-hook-form';

import { FormItems, TriggerItem } from './TriggersPage.types';

const getLabelText = (isRegex: boolean) => (isRegex ? 'Enter a regex pattern' : 'Enter a tag');

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

  const { conditions, pipelineable } = watch();

  const { isRegex } = conditions[conditionNumber] || {};

  const isEditMode = !!editedItem;

  const onFormSubmit = (data: FormItems) => {
    const filteredData = data;
    filteredData.conditions = data.conditions
      .filter(({ type }) => !!type)
      .map((condition) => {
        const newCondition = { ...condition };
        if (newCondition.value === '') {
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
  const isConditionsUsed = currentTriggers
    .map(({ conditions: currentConditions }) => JSON.stringify(currentConditions))
    .includes(
      JSON.stringify(
        conditions.map((condition) => {
          const newCondition = { ...condition };
          if (newCondition.value === '') {
            newCondition.value = '*';
          }
          return newCondition;
        }),
      ),
    );

  const isSubmitDisabled = isPipelineableMissing || isConditionsUsed;

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
          <Text marginBottom="16" textStyle="body/md/semibold">
            Tag
          </Text>
          <Checkbox marginBottom="8" {...register(`conditions.${conditionNumber}.isRegex`)}>
            Use regex pattern
          </Checkbox>
          <Tooltip label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text.">
            <Icon name="Info" size="16" marginLeft="5" />
          </Tooltip>
          <Input
            marginBottom="24"
            label={getLabelText(isRegex)}
            placeholder="*"
            {...register(`conditions.${conditionNumber}.value`)}
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
                  <option key={p} value={`worfklow#${p}`}>
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
          <Tooltip
            isDisabled={!isSubmitDisabled}
            label={
              isPipelineableMissing
                ? 'Please select a pipeline or workflow.'
                : 'You previously added the same set of conditions for another trigger. Please check and try again.'
            }
          >
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
