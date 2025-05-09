import {
  Box,
  Button,
  DefinitionTooltip,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  ProgressIndicator,
  ProgressIndicatorProps,
  Select,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';

import ConditionCard from '@/components/unified-editor/Triggers/components/AddTrigger/ConditionCard';
import { TriggerItem } from '@/components/unified-editor/Triggers/Triggers.types';
import { LEGACY_LABELS_MAP, LEGACY_OPTIONS_MAP, LegacyTagConditionType } from '@/core/models/Trigger.legacy';
import usePipelineIds from '@/hooks/usePipelineIds';
import useWorkflowIds from '@/hooks/useWorkflowIds';

import { checkIsConditionsUsed } from '../../TriggersPage.utils';

const OPTIONS_MAP = LEGACY_OPTIONS_MAP.tag;
const LABELS_MAP = LEGACY_LABELS_MAP.tag;

type DialogProps = {
  isOpen: boolean;
  editedItem?: TriggerItem;
  currentTriggers: TriggerItem[];
  onSubmit: (action: 'add' | 'edit', trigger: TriggerItem) => void;
  onClose: () => void;
};

const AddTagTriggerDialog = (props: DialogProps) => {
  const { isOpen, editedItem, currentTriggers, onClose, onSubmit } = props;
  const isEditMode = !!editedItem;

  const pipelines = usePipelineIds();
  const workflows = useWorkflowIds(true);

  const [activeStageIndex, setActiveStageIndex] = useState<0 | 1>(0);
  const dialogStages: ProgressIndicatorProps['stages'] = [
    {
      action: activeStageIndex === 1 ? { onClick: () => setActiveStageIndex(0) } : undefined,
      label: 'Conditions',
    },
    { label: 'Target' },
  ];

  const defaultValues: TriggerItem = useMemo(() => {
    return {
      conditions: [
        {
          isRegex: false,
          type: 'tag',
          value: '',
        },
      ],
      uniqueId: crypto.randomUUID(),
      pipelineable: '',
      type: 'tag',
      isActive: true,
      ...editedItem,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedItem, isOpen]);

  const formMethods = useForm<TriggerItem>({
    defaultValues,
  });

  const { control, reset, handleSubmit, watch } = formMethods;
  const { conditions, pipelineable } = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen, editedItem]);

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'conditions',
    keyName: 'uniqueId',
  });

  const onFormCancel = () => {
    onClose();
    reset(defaultValues);
    setActiveStageIndex(0);
  };

  const onFormSubmit = (data: TriggerItem) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = newCondition.isRegex ? '.*' : '*';
      }

      return newCondition;
    });
    onSubmit(isEditMode ? 'edit' : 'add', filteredData as TriggerItem);
    onFormCancel();
  };

  const onAppend = () => {
    const availableTypes = Object.keys(OPTIONS_MAP) as LegacyTagConditionType[];
    const usedTypes = conditions.map((condition) => condition.type);
    const newType = availableTypes.find((type) => !usedTypes.includes(type));

    if (!newType) {
      return;
    }

    append({
      type: newType,
      value: '',
      isRegex: false,
    });
  };

  const isConditionsUsed = checkIsConditionsUsed(currentTriggers, watch() as TriggerItem);

  const isPipelineableMissing = !pipelineable;

  return (
    <FormProvider {...formMethods}>
      <Dialog
        title={isEditMode ? 'Edit trigger' : 'Add tag trigger'}
        as="form"
        maxWidth="640"
        isOpen={isOpen}
        onClose={onFormCancel}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          <Box marginBottom="24">
            <ProgressIndicator variant="horizontal" stages={dialogStages} activeStageIndex={activeStageIndex} />
          </Box>
          <Divider marginBottom="24" />
          {activeStageIndex === 0 ? (
            <>
              <Text marginBottom="4" textStyle="heading/h3">
                Set up trigger conditions
              </Text>
              <Text marginBottom="24" color="text/secondary">
                Configure the{' '}
                <DefinitionTooltip label="Configure the conditions that should all be met to execute the targeted Pipeline or Workflow.">
                  conditions
                </DefinitionTooltip>{' '}
                that should all be met to execute the targeted Pipeline or Workflow.
              </Text>
              <ConditionCard
                fields={fields}
                labelsMap={LABELS_MAP}
                append={onAppend}
                optionsMap={OPTIONS_MAP}
                remove={remove}
              />
            </>
          ) : (
            <>
              <Text color="text/primary" textStyle="heading/h3" marginBottom="4">
                Targeted Pipeline or Workflow
              </Text>
              <Text color="text/secondary" marginBottom="24">
                Select the Pipeline or Workflow you want Bitrise to run when trigger conditions are met.
              </Text>
              <Controller
                name="pipelineable"
                control={control}
                render={({ field }) => (
                  <Select placeholder="Select a Pipeline or Workflow" {...field}>
                    {pipelines.length && (
                      <optgroup label="Pipelines">
                        {pipelines.map((p) => (
                          <option key={p} value={`pipelines#${p}`}>
                            {p}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {workflows.length && (
                      <optgroup label="Workflows">
                        {workflows.map((p) => (
                          <option key={p} value={`workflows#${p}`}>
                            {p}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Select>
                )}
              />
            </>
          )}
        </DialogBody>
        <DialogFooter display="flex" justifyContent="flex-end">
          <Button onClick={onFormCancel} variant="tertiary" marginInlineEnd="auto">
            Cancel
          </Button>
          {activeStageIndex === 0 ? (
            <Tooltip
              isDisabled={!isConditionsUsed}
              label="You previously added this tag for another trigger. Please check and try again."
            >
              <Button isDisabled={isConditionsUsed} rightIconName="ArrowRight" onClick={() => setActiveStageIndex(1)}>
                Next
              </Button>
            </Tooltip>
          ) : (
            <>
              <Button leftIconName="ArrowLeft" variant="secondary" onClick={() => setActiveStageIndex(0)}>
                Previous
              </Button>
              <Tooltip isDisabled={!isPipelineableMissing} label="Please select a pipeline or workflow.">
                <Button type="submit" isDisabled={isPipelineableMissing}>
                  {isEditMode ? 'Done' : 'Add trigger'}
                </Button>
              </Tooltip>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default AddTagTriggerDialog;
