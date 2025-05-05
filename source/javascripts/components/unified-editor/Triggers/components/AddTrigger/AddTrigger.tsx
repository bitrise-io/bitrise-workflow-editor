import { Box, Button, ButtonGroup, Checkbox, Divider, Link, Text, Tooltip } from '@bitrise/bitkit';
import { isEqual } from 'es-toolkit';
import { useMemo } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import PriorityInput from '@/components/unified-editor/PriorityInput/PriorityInput';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { TriggerMapItemModelRegexCondition } from '@/core/models/BitriseYml';

import { ConditionType, FormItems, TargetBasedTriggerItem, TriggerType } from '../../Triggers.types';
import { getConditionList } from '../../Triggers.utils';
import ConditionCard from './ConditionCard';

type AddTriggerProps = {
  id?: string;
  triggerType: TriggerType;
  onSubmit: (trigger: TargetBasedTriggerItem) => void;
  onCancel: () => void;
  optionsMap: Record<ConditionType, string>;
  labelsMap: Record<string, string>;
  editedItem?: TargetBasedTriggerItem;
  currentTriggers: TargetBasedTriggerItem[];
  trackingData: Record<string, number | string | boolean>;
  entity: 'Workflow' | 'Pipeline';
};

const AddTrigger = (props: AddTriggerProps) => {
  const { currentTriggers, editedItem, labelsMap, onCancel, onSubmit, optionsMap, triggerType, trackingData, entity } =
    props;

  const defaultConditions = useMemo(() => {
    if (editedItem) {
      return getConditionList(editedItem);
    }
    return [
      {
        type: Object.keys(optionsMap)[0] as ConditionType,
        value: '',
        isRegex: false,
      },
    ];
  }, [editedItem, optionsMap]);

  const formMethods = useForm<FormItems>({
    defaultValues: {
      conditions: defaultConditions,
      isDraftPr: editedItem?.draft_enabled !== false,
      priority: editedItem?.priority,
    },
  });

  const { control, handleSubmit, setValue, reset, watch } = formMethods;

  const { conditions, isDraftPr, priority } = watch();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  const onAppend = () => {
    const availableTypes = Object.keys(optionsMap) as ConditionType[];
    const usedTypes = conditions.map((condition) => condition.type);
    const newType = availableTypes.find((type) => !usedTypes.includes(type));
    append({
      type: newType,
      value: '',
      isRegex: false,
    });
  };

  const onFormSubmit = (data: FormItems) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition) => {
      const newCondition = { ...condition };
      newCondition.value = newCondition.value.trim();
      if (!newCondition.value) {
        newCondition.value = newCondition.isRegex ? '.*' : '*';
      }
      return newCondition;
    });

    const newTrigger: any = {};
    filteredData.conditions.forEach((condition) => {
      const value = condition.isRegex ? { regex: condition.value } : { pattern: condition.value };
      if (condition.type) {
        newTrigger[condition.type] = value;
      }
    });

    if (!data.isDraftPr) {
      newTrigger.draft_enabled = false;
    } else {
      delete newTrigger.draft_enabled;
    }

    if (data.priority === undefined) {
      delete newTrigger.priority;
    } else {
      newTrigger.priority = Number(data.priority);
    }
    onSubmit(newTrigger);
  };

  const handleSegmentTrack = () => {
    const triggerConditions: Record<string, TriggerMapItemModelRegexCondition> = {};
    conditions.forEach((condition) => {
      let value = {};
      if (condition.isRegex) {
        value = { regex: condition.value };
      } else {
        value = { wildcard: condition.value };
      }
      triggerConditions[condition.type || ''] = value as TriggerMapItemModelRegexCondition;
    });
    segmentTrack(
      editedItem
        ? 'Workflow Editor Apply Trigger Changes Button Clicked'
        : 'Workflow Editor Add Trigger Button Clicked',
      {
        ...trackingData,
        build_trigger_type: triggerType,
        trigger_conditions: triggerConditions,
        trigger_origin: 'workflow_triggers',
      },
    );
  };

  let isSameTriggerExist = false;
  currentTriggers.forEach((trigger) => {
    if (isEqual(getConditionList(trigger), conditions) && isEqual(trigger.draft_enabled !== false, isDraftPr)) {
      isSameTriggerExist = true;
    }
  });

  const title = editedItem
    ? `Edit ${triggerType.replace('_', ' ')} trigger`
    : `Add ${triggerType.replace('_', ' ')} trigger`;

  const handleCancel = () => {
    reset();
    onCancel();
  };

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if ((!(type === 'name' || type === 'target_branch' || type === 'source_branch') && !value) || !type) {
      hasEmptyCondition = true;
    }
  });

  return (
    <FormProvider {...formMethods}>
      <Box as="form" display="flex" flexDir="column" height="100%" onSubmit={handleSubmit(onFormSubmit)}>
        <Box>
          <Text textStyle="heading/h4" marginBlockEnd="4">
            {title}
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary" marginBlockEnd="16">
            Specify {Object.keys(optionsMap).length > 1 ? 'conditions' : 'a condition'} for when this {entity} should
            run.
          </Text>
          <ConditionCard
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
          <Divider marginBlock="24" />
          <PriorityInput
            onChange={(newValue) => setValue('priority', newValue)}
            value={priority}
            helperText={`Assign a priority to builds started by this trigger. Enter a value from -100 (lowest) to +100 (highest). This setting overrides the priority assigned to this ${entity}. Available on certain plans only.`}
          />
        </Box>
        <ButtonGroup spacing="16" paddingY="24" paddingBlockStart="32" marginBlockStart="auto">
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
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </ButtonGroup>
      </Box>
    </FormProvider>
  );
};

export default AddTrigger;
