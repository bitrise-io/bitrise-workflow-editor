import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  DefinitionTooltip,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Input,
  ProgressIndicator,
  ProgressIndicatorProps,
  Select,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { Condition, FormItems, PushConditionType, TriggerItem } from './TriggersPage.types';
import { checkIsConditionsUsed } from './TriggersPage.utils';
import RegexCheckbox from './RegexCheckbox';

type DialogProps = {
  currentTriggers: TriggerItem[];
  isOpen: boolean;
  onClose: () => void;
  pipelines: string[];
  onSubmit: (action: 'add' | 'edit', trigger: TriggerItem) => void;
  editedItem?: TriggerItem;
  workflows: string[];
};

const LABEL_MAP: Record<PushConditionType, string> = {
  push_branch: 'Push branch',
  commit_message: 'Commit message',
  changed_files: 'Path',
};

const getLabelText = (isRegex: boolean, type: PushConditionType): string => {
  if (isRegex) {
    return 'Regex pattern';
  }
  return LABEL_MAP[type];
};

type ConditionCardProps = {
  children: ReactNode;
  conditionNumber: number;
};

const OPTIONS_MAP: Record<PushConditionType, string> = {
  push_branch: 'Push branch',
  commit_message: 'Commit message',
  changed_files: 'File change',
};

const ConditionCard = (props: ConditionCardProps) => {
  const { children, conditionNumber } = props;
  const { control, watch, setValue } = useFormContext();
  const { conditions } = watch();
  const { isRegex, type } = conditions[conditionNumber] || {};

  return (
    <Card key={conditionNumber} marginBottom="16" padding="16px 16px 24px 16px">
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="12">
        <Text textStyle="heading/h5">Condition {conditionNumber + 1}</Text>
        {children}
      </Box>
      <Controller
        name={`conditions.${conditionNumber}.type`}
        control={control}
        render={({ field }) => (
          <Select marginBottom="16" placeholder="Select a condition type" {...field}>
            {Object.entries(OPTIONS_MAP).map(([optionType, text]) => {
              const isConditionTypeUsed = conditions.some((condition: Condition) => condition.type === optionType);
              const isTypeOfCurrentCard = optionType === conditions[conditionNumber].type;

              if (isConditionTypeUsed && !isTypeOfCurrentCard) {
                return undefined;
              }

              return (
                <option key={optionType} value={optionType}>
                  {text}
                </option>
              );
            })}
          </Select>
        )}
      />
      {!!type && (
        <>
          <RegexCheckbox
            isChecked={isRegex}
            onChange={(e) => setValue(`conditions.${conditionNumber}.isRegex`, e.target.checked)}
          />
          <Controller
            name={`conditions.${conditionNumber}.value`}
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                onChange={(e) => field.onChange(e.target.value.trimStart())}
                label={getLabelText(isRegex, type)}
                placeholder={isRegex ? '.*' : '*'}
                marginBottom="4"
              />
            )}
          />
          {type === 'push_branch' && (
            <Text color="sys/neutral/base" textStyle="body/sm/regular">
              If you leave it blank, Bitrise will start builds for any push branch.
            </Text>
          )}
        </>
      )}
    </Card>
  );
};

const AddPushTriggerDialog = (props: DialogProps) => {
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

  const defaultValues: FormItems = useMemo(() => {
    return {
      conditions: [
        {
          isRegex: false,
          type: 'push_branch',
          value: '',
        },
      ],
      id: crypto.randomUUID(),
      pipelineable: '',
      source: 'push',
      isActive: true,
      ...editedItem,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedItem, isOpen]);

  const formMethods = useForm<FormItems>({
    defaultValues,
  });

  const { control, reset, handleSubmit, watch } = formMethods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen, editedItem]);

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  const onFormCancel = () => {
    onClose();
    reset(defaultValues);
    setActiveStageIndex(0);
  };

  const onFormSubmit = (data: FormItems) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.isRegex && !newCondition.value) {
        newCondition.value = '*';
      }
      if (newCondition.isRegex && !newCondition.value) {
        newCondition.value = '.*';
      }
      return newCondition;
    });
    onSubmit(isEditMode ? 'edit' : 'add', filteredData as TriggerItem);
    onFormCancel();
  };

  const onAppend = () => {
    append({
      isRegex: false,
      type: '',
      value: '',
    });
  };

  const { conditions, pipelineable } = watch();

  const isConditionsUsed = checkIsConditionsUsed(currentTriggers, watch() as TriggerItem);

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if ((type !== 'push_branch' && !value) || !type) {
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
        title={isEditMode ? 'Edit trigger' : 'Add push trigger'}
        maxWidth="480"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          <ProgressIndicator variant="horizontal" stages={dialogStages} activeStageIndex={activeStageIndex} />
          <Divider marginY="24" />
          {activeStageIndex === 0 ? (
            <>
              <Text color="text/primary" textStyle="heading/h3" marginBottom="4">
                Set up trigger conditions
              </Text>
              <Text color="text/secondary" marginBottom="24">
                Configure the{' '}
                <DefinitionTooltip label="Configure the conditions that should all be met to execute the targeted Pipeline or Workflow.">
                  conditions
                </DefinitionTooltip>{' '}
                that should all be met to execute the targeted Pipeline or Workflow.
              </Text>
              {fields.map((item, index) => {
                return (
                  <ConditionCard conditionNumber={index} key={item.id}>
                    {index > 0 && (
                      <Button leftIconName="MinusRemove" onClick={() => remove(index)} size="sm" variant="tertiary">
                        Remove
                      </Button>
                    )}
                  </ConditionCard>
                );
              })}

              <Button
                variant="secondary"
                leftIconName="PlusAdd"
                width="100%"
                onClick={onAppend}
                isDisabled={fields.length >= Object.keys(OPTIONS_MAP).length}
              >
                Add condition
              </Button>
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

export default AddPushTriggerDialog;
