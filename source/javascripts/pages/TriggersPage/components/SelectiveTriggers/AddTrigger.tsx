import { Button, Text } from '@bitrise/bitkit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { SourceType } from '../TriggersPage/TriggersPage.types';
import ConditionCard from './ConditionCard';

type AddTriggerProps = {
  workflowId?: string;
  triggerType: SourceType;
  onSubmit: (trigger: any) => void;
  onCancel: () => void;
  optionsMap: Record<string, string>;
  labelsMap: Record<string, string>;
};

const AddTrigger = (props: AddTriggerProps) => {
  const { labelsMap, onCancel, onSubmit, optionsMap, triggerType, workflowId } = props;

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

  const { control, handleSubmit, reset } = formMethods;

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
    console.log('data', data);
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

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
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
          marginBlockEnd="56"
        >
          Add condition
        </Button>
        <Button type="submit" marginInlineEnd="16">
          Add trigger
        </Button>
        <Button variant="tertiary" onClick={handleCancel}>
          Cancel
        </Button>
      </form>
    </FormProvider>
  );
};

export default AddTrigger;
