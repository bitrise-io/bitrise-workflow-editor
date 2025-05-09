import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Link,
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
import { LEGACY_LABELS_MAP, LEGACY_OPTIONS_MAP, LegacyPrConditionType } from '@/core/models/Trigger.legacy';

import { checkIsConditionsUsed } from '../../TriggersPage.utils';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  workflows: string[];
  pipelines: string[];
  editedItem?: TriggerItem;
  currentTriggers: TriggerItem[];
  onSubmit: (action: 'add' | 'edit', trigger: TriggerItem) => void;
};

const OPTIONS_MAP = LEGACY_OPTIONS_MAP.pull_request;
const LABELS_MAP = LEGACY_LABELS_MAP.pull_request;

const AddPrTriggerDialog = (props: DialogProps) => {
  const { currentTriggers, isOpen, onClose, pipelines, onSubmit, editedItem, workflows } = props;
  const [activeStageIndex, setActiveStageIndex] = useState<0 | 1>(0);

  const isEditMode = !!editedItem;

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
          type: 'pull_request_target_branch',
          value: '',
        },
      ],
      uniqueId: crypto.randomUUID(),
      pipelineable: '',
      type: 'pull_request',
      isDraftPr: true,
      isActive: true,
      ...editedItem,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedItem, isOpen]);

  const formMethods = useForm<TriggerItem>({
    defaultValues,
  });

  const { control, formState, reset, handleSubmit, watch, setValue } = formMethods;

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
    const availableTypes = Object.keys(OPTIONS_MAP) as LegacyPrConditionType[];
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

  const { conditions, pipelineable, isDraftPr } = watch();

  let isConditionsUsed = checkIsConditionsUsed(currentTriggers, watch() as TriggerItem);

  // Because draft PR checkbox is a condition
  if (formState.dirtyFields.isDraftPr) {
    isConditionsUsed = false;
  }

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if ((!(type === 'pull_request_target_branch' || type === 'pull_request_source_branch') && !value) || !type) {
      hasEmptyCondition = true;
    }
  });

  const isPipelineableMissing = !pipelineable;

  return (
    <FormProvider {...formMethods}>
      <Dialog
        as="form"
        isOpen={isOpen}
        onClose={onFormCancel}
        title={isEditMode ? 'Edit trigger' : 'Add pull request trigger'}
        maxWidth="640"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          <Box marginBottom="24">
            <ProgressIndicator variant="horizontal" stages={dialogStages} activeStageIndex={activeStageIndex} />
          </Box>
          <Divider marginBottom="24" />
          {activeStageIndex === 0 ? (
            <>
              <Text color="text/primary" textStyle="heading/h3" marginBottom="4">
                Set up trigger conditions
              </Text>
              <Text color="text/secondary" marginBottom="24">
                Configure the{' '}
                <Tooltip label="Configure the conditions that should all be met to execute the targeted Pipeline or Workflow.">
                  conditions
                </Tooltip>{' '}
                that should all be met to execute the targeted Pipeline or Workflow.
              </Text>
              <ConditionCard
                fields={fields}
                labelsMap={LABELS_MAP}
                append={onAppend}
                optionsMap={OPTIONS_MAP}
                remove={remove}
              />
              <Checkbox
                isChecked={isDraftPr}
                mt={16}
                helperText={
                  <>
                    Supported for GitHub and GitLab.{' '}
                    <Link
                      colorScheme="purple"
                      href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html#triggering-builds-from-draft-prs"
                      isExternal
                    >
                      Learn more
                    </Link>
                  </>
                }
                onChange={(e) => setValue(`isDraftPr`, e.target.checked)}
              >
                Include draft pull requests
              </Checkbox>
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
            </>
          )}
        </DialogBody>
        <DialogFooter display="flex" justifyContent="flex-end">
          <Button onClick={onFormCancel} variant="tertiary" marginInlineEnd="auto">
            Cancel
          </Button>
          {activeStageIndex === 0 ? (
            <Tooltip
              isDisabled={!isConditionsUsed && !hasEmptyCondition}
              label={
                isConditionsUsed
                  ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
                  : 'Please fill all conditions.'
              }
            >
              <Button
                isDisabled={isConditionsUsed || hasEmptyCondition}
                rightIconName="ArrowRight"
                onClick={() => setActiveStageIndex(1)}
              >
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

export default AddPrTriggerDialog;
