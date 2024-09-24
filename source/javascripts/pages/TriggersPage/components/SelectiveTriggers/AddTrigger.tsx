import { Button, Text } from '@bitrise/bitkit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { ConditionCard } from '../LegacyTriggers/AddPrTriggerDialog';
import { SourceType } from '../TriggersPage/TriggersPage.types';

type AddTriggerProps = {
  workflowId?: string;
  triggerType: SourceType;
  onSubmit: (trigger: any) => void;
};

const AddTrigger = (props: AddTriggerProps) => {
  const { onSubmit, triggerType, workflowId } = props;

  const OPTIONS_MAP: Record<string, string> = {
    push_branch: 'Push branch',
    commit_message: 'Commit message',
    changed_files: 'File change',
  };

  const formMethods = useForm({
    defaultValues: {
      conditions: [
        {
          type: '',
          value: '',
          isRegex: false,
        },
      ],
    },
  });

  const { control, handleSubmit } = formMethods;

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
    filteredData.conditions = data.conditions.map((condition: any) => {
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
    onSubmit(filteredData);
  };

  let title;
  if (triggerType === 'push') {
    title = 'Add push trigger';
  } else if (triggerType === 'pull_request') {
    title = 'Add pull request trigger';
  } else if (triggerType === 'tag') {
    title = 'Add tag trigger';
  }

  return (
    <FormProvider {...formMethods}>
      <Text textStyle="heading/h3" marginBlockEnd="8">
        {title}
      </Text>
      <Text textStyle="body/lg/regular" color="text/secondary" marginBlockEnd="24">
        Set up the trigger conditions that should all be met to execute the {workflowId} Workflow.
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
        marginBlockEnd="56"
      >
        Add condition
      </Button>
      <Button onSubmit={handleSubmit(onFormSubmit)} marginInlineEnd="16">
        Add trigger
      </Button>
      <Button variant="tertiary">Cancel</Button>
    </FormProvider>
  );
};

export default AddTrigger;
