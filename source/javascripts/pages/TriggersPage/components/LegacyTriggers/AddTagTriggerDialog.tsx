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
  Toggletip,
  Tooltip,
} from '@bitrise/bitkit';
import { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { FormItems, TriggerItem } from '@/components/unified-editor/Triggers/Triggers.types';

import { checkIsConditionsUsed } from '../../TriggersPage.utils';

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

  const { control, reset, handleSubmit, watch, setValue } = formMethods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen, editedItem]);

  const { conditions, pipelineable } = watch();
  const conditionNumber: number = 0;
  const { isRegex } = conditions[conditionNumber] || {};

  const isEditMode = !!editedItem;

  const onFormSubmit = (data: FormItems) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = isRegex ? '.*' : '*';
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
          <Checkbox
            marginBottom="16"
            isChecked={isRegex}
            onChange={(e) => setValue(`conditions.${conditionNumber}.isRegex`, e.target.checked)}
          >
            Use regex pattern
            <Toggletip
              label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text. Bitrise uses Ruby's Regexp#match method."
              learnMoreUrl="https://docs.ruby-lang.org/en/3.2/Regexp.html#class-Regexp-label-Regexp-23match+Method"
            >
              <Icon name="Info" size="16" marginLeft="5" />
            </Toggletip>
          </Checkbox>
          <Controller
            name={`conditions.${conditionNumber}.value`}
            render={({ field }) => (
              <Input
                marginBottom="4"
                {...field}
                onChange={(e) => field.onChange(e.target.value.trimStart())}
                placeholder={isRegex ? '.*' : '*'}
              />
            )}
          />
          <Text marginBottom="24" color="sys/neutral/base" textStyle="body/sm/regular">
            If you leave it blank, Bitrise will start builds for any tag.
          </Text>
          <Text color="text/primary" textStyle="body/md/semibold" marginBottom="4">
            Targeted Pipeline or Workflow
          </Text>
          <Controller
            name="pipelineable"
            control={control}
            render={({ field }) => (
              <Select placeholder="Select a Pipeline or Workflow" {...field}>
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
            )}
          />
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
