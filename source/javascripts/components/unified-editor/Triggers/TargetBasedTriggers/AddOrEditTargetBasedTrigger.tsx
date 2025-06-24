import {
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  Link,
  Select,
  Tooltip,
} from '@bitrise/bitkit';
import { isEqual } from 'es-toolkit';
import { useMemo } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';

import PriorityInput from '@/components/unified-editor/PriorityInput/PriorityInput';
import { trackAddTrigger, trackEditTrigger } from '@/core/analytics/TriggerAnalytics';
import {
  TARGET_BASED_LABELS_MAP,
  TARGET_BASED_OPTIONS_MAP,
  TargetBasedConditionType,
  TargetBasedTrigger,
  TriggerSource,
  TriggerType,
} from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';
import usePipelineIds from '@/hooks/usePipelineIds';
import useWorkflowIds from '@/hooks/useWorkflowIds';

import ConditionCard from '../ConditionCard';

type Props = {
  source: TriggerSource;
  sourceId: string;
  triggerType: TriggerType;
  editedItem?: TargetBasedTrigger;
  currentTriggers: TargetBasedTrigger[] | LegacyTrigger[];
  onSubmit: (trigger: any) => void;
  onCancel: () => void;
  isOpen: boolean;
  isLegacy?: boolean;
};

const AddOrEditTargetBasedTrigger = (props: Props) => {
  const { source, sourceId, editedItem, currentTriggers, triggerType, onCancel, onSubmit, isOpen, isLegacy } = props;

  const pipelines = usePipelineIds();
  const workflows = useWorkflowIds(true);

  const optionsMap = useMemo(() => TARGET_BASED_OPTIONS_MAP[triggerType], [triggerType]);
  const labelsMap = useMemo(() => TARGET_BASED_LABELS_MAP[triggerType], [triggerType]);
  const entity = useMemo(() => (source === 'pipelines' ? 'Pipeline' : 'Workflow'), [source]);

  const defaultValues = useMemo<TargetBasedTrigger>(
    () => ({
      conditions: [
        {
          type: Object.keys(optionsMap)[0] as TargetBasedConditionType,
          value: '',
          isRegex: false,
        },
      ],
      uniqueId: editedItem?.uniqueId || crypto.randomUUID(),
      source: `${source}#${sourceId}`,
      index: editedItem?.index || currentTriggers.length,
      triggerType,
      isActive: true,
      isDraftPr: true,
      ...editedItem,
    }),
    [currentTriggers.length, editedItem, optionsMap, source, sourceId, triggerType],
  );

  const formMethods = useForm<TargetBasedTrigger>({ defaultValues });
  const { control, handleSubmit, setValue, reset, watch } = formMethods;
  const { conditions, isDraftPr, priority } = watch();
  const { append, fields, remove } = useFieldArray({ control, name: 'conditions', keyName: 'uniqueId' });

  const onAppend = () => {
    const availableTypes = Object.keys(optionsMap) as TargetBasedConditionType[];
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

  const onFormSubmit = (data: TargetBasedTrigger) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = newCondition.isRegex ? '.*' : '*';
      }
      return newCondition;
    });

    onSubmit(filteredData);
  };

  const handleSegmentTrack = () => {
    if (editedItem) {
      trackEditTrigger(watch());
    } else {
      trackAddTrigger(watch());
    }
  };

  const title = editedItem
    ? `Edit ${triggerType.replace('_', ' ')} trigger`
    : `Add ${triggerType.replace('_', ' ')} trigger`;

  let isSameTriggerExist = false;
  currentTriggers.forEach((trigger) => {
    if (
      trigger.uniqueId !== editedItem?.uniqueId &&
      isEqual(trigger.conditions, conditions) &&
      isEqual(trigger.isDraftPr, isDraftPr) &&
      isEqual(trigger.priority, priority)
    ) {
      isSameTriggerExist = true;
    }
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if (
      (!(type === 'name' || type === 'target_branch' || type === 'source_branch' || type === 'branch') && !value) ||
      !type
    ) {
      hasEmptyCondition = true;
    }
  });

  return (
    <FormProvider {...formMethods}>
      <Dialog
        as="form"
        maxWidth="640"
        isOpen={isOpen}
        onClose={onCancel}
        title={title}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <DialogBody>
          {isLegacy && (
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select label="Target" placeholder="Select a Pipeline or Workflow" isRequired mb="24" {...field}>
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
          )}
          <ConditionCard
            triggerType={triggerType}
            fields={fields}
            labelsMap={labelsMap}
            append={onAppend}
            optionsMap={optionsMap}
            remove={remove}
          />
          {triggerType === 'pull_request' && (
            <Checkbox
              isChecked={isDraftPr}
              marginBlockStart="24"
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
          )}
          {!isLegacy && (
            <PriorityInput
              onChange={(newValue) => setValue('priority', newValue)}
              value={priority}
              helperText={`Assign a priority to builds started by this trigger. Enter a value from -100 (lowest) to +100 (highest). This setting overrides the priority assigned to this ${entity}. Available on certain plans only.`}
              mt="24"
            />
          )}
        </DialogBody>
        <DialogFooter>
          <ButtonGroup spacing="16">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Tooltip
              isDisabled={!isSameTriggerExist && !hasEmptyCondition}
              label={
                isSameTriggerExist
                  ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
                  : 'Please fill all conditions.'
              }
            >
              <Button type="submit" onClick={handleSegmentTrack} isDisabled={isSameTriggerExist || hasEmptyCondition}>
                {editedItem ? 'Apply changes' : 'Add trigger'}
              </Button>
            </Tooltip>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default AddOrEditTargetBasedTrigger;
