import { Box, Button, ButtonGroup, Checkbox, Link, Text, Tooltip } from '@bitrise/bitkit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Condition, ConditionType, FormItems, SourceType } from '../TriggersPage/TriggersPage.types';
import ConditionCard from './ConditionCard';

type AddTriggerProps = {
  workflowId?: string;
  triggerType: SourceType;
  onSubmit: (trigger: any) => void;
  onCancel: () => void;
  optionsMap: Record<ConditionType, string>;
  labelsMap: Record<string, string>;
  areTriggersEnabled: boolean;
};

const AddTrigger = (props: AddTriggerProps) => {
  const { areTriggersEnabled, labelsMap, onCancel, onSubmit, optionsMap, triggerType, workflowId } = props;

  const formMethods = useForm<FormItems>({
    defaultValues: {
      conditions: [
        {
          type: Object.keys(optionsMap)[0] as ConditionType,
          value: '',
          isRegex: false,
        },
      ],
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

  const onFormSubmit = (data: any) => {
    const filteredData = data;
    filteredData.conditions = data.conditions.map((condition: Condition) => {
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

    const newTrigger: any = {};
    filteredData.conditions.forEach((condition: Condition) => {
      const value = condition.isRegex ? { regex: condition.value } : condition.value;
      newTrigger[condition.type] = value;
    });

    if (data.isDraftPr) {
      newTrigger.draft_enabled = true;
    }

    if (areTriggersEnabled === false) {
      newTrigger.enabled = false;
    }

    onSubmit(newTrigger);
  };

  let title;
  if (triggerType === 'push') {
    title = 'Add push trigger';
  } else if (triggerType === 'pull_request') {
    title = 'Add pull request trigger';
  } else if (triggerType === 'tag') {
    title = 'Add tag trigger';
  }

  const handleCancel = () => {
    reset();
    onCancel();
  };

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if ((!(type === 'target_branch' || type === 'source_branch') && !value) || !type) {
      hasEmptyCondition = true;
    }
  });

  const isConditionsUsed = false;

  return (
    <FormProvider {...formMethods}>
      <Box as="form" display="flex" flexDir="column" height="100%" onSubmit={handleSubmit(onFormSubmit)}>
        <Box padding="24">
          <Text textStyle="heading/h3" marginBlockEnd="8">
            {title}
          </Text>
          <Text textStyle="body/lg/regular" color="text/secondary" marginBlockEnd="24">
            Set up the trigger conditions that should all be met to execute the {workflowId} Workflow.
          </Text>
          {fields.map((item, index) => {
            return (
              <ConditionCard conditionNumber={index} key={item.id} optionsMap={optionsMap} labelsMap={labelsMap}>
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
        <ButtonGroup spacing="16" padding="24" paddingBlockStart="32" marginBlockStart="auto">
          <Tooltip
            isDisabled={!isConditionsUsed && !hasEmptyCondition}
            label={
              isConditionsUsed
                ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
                : 'Please fill all conditions.'
            }
          >
            <Button type="submit" isDisabled={isConditionsUsed || hasEmptyCondition}>
              Add trigger
            </Button>
          </Tooltip>
          <Button variant="tertiary" onClick={handleCancel}>
            Cancel
          </Button>
        </ButtonGroup>
      </Box>
    </FormProvider>
  );
};

export default AddTrigger;
