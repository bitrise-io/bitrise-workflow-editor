import { useMemo } from 'react';
import { Box, Button, ButtonGroup, Checkbox, Link, Text, Tooltip } from '@bitrise/bitkit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { isEqual } from 'es-toolkit';
import { segmentTrack } from '@/utils/segmentTracking';
import {
  TriggerType,
  TargetBasedTriggerItem,
  ConditionType,
  FormItems,
} from '@/pages/TriggersPage/components/TriggersPage/TriggersPage.types';
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
};

const AddTrigger = (props: AddTriggerProps) => {
  const { currentTriggers, editedItem, labelsMap, onCancel, onSubmit, optionsMap, triggerType, id, trackingData } =
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
    },
  });

  const { control, handleSubmit, setValue, reset, watch } = formMethods;

  const { conditions, isDraftPr } = watch();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  const onAppend = () => {
    append({
      type: '',
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
      const value = condition.isRegex ? { regex: condition.value } : condition.value;
      if (condition.type) {
        newTrigger[condition.type] = value;
      }
    });

    if (!data.isDraftPr) {
      newTrigger.draft_enabled = false;
    } else {
      delete newTrigger.draft_enabled;
    }

    onSubmit(newTrigger);
  };

  const handleSegmentTrack = () => {
    const triggerConditions: Record<string, any> = {};
    conditions.forEach((condition) => {
      let value: any = {};
      if (condition.isRegex) {
        value = { regex: condition.value };
      } else {
        value = { wildcard: condition.value };
      }
      triggerConditions[condition.type || ''] = value;
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
          <Text textStyle="heading/h3" marginBlockEnd="8">
            {title}
          </Text>
          <Text textStyle="body/lg/regular" color="text/secondary" marginBlockEnd="24">
            Set up the trigger conditions that should all be met to execute the {id} target.
          </Text>
          {fields.map((item, index) => {
            return (
              <ConditionCard conditionNumber={index} key={item.id} optionsMap={optionsMap} labelsMap={labelsMap}>
                {index > 0 && (
                  <Button leftIconName="MinusCircle" onClick={() => remove(index)} size="sm" variant="tertiary">
                    Remove
                  </Button>
                )}
              </ConditionCard>
            );
          })}
          <Button
            variant="secondary"
            leftIconName="PlusCircle"
            width="100%"
            onClick={onAppend}
            isDisabled={fields.length >= Object.keys(optionsMap).length}
          >
            Add condition
          </Button>
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
