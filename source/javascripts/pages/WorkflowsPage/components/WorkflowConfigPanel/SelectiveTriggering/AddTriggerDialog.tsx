import { useEffect, useMemo } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, Text, Tooltip } from '@bitrise/bitkit';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { FormItems, PushConditionType, TriggerItem } from '../../../../TriggersPage/TriggersPage.types';
import { ConditionCard } from '../../../../TriggersPage/AddPushTriggerDialog';
import { checkIsConditionsUsed } from '../../../../TriggersPage/TriggersPage.utils';

type AddTriggerDialogProps = {
  currentTriggers: TriggerItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: 'add' | 'edit', trigger: TriggerItem) => void;
  editedItem?: TriggerItem;
  workflows: string[];
};

const AddTriggerDialog = (props: AddTriggerDialogProps) => {
  const { isOpen, onClose, currentTriggers, onSubmit, editedItem, workflows } = props;

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

  const formMethods = useForm<FormItems>({ defaultValues });

  const { control, handleSubmit, reset, watch } = formMethods;

  const isEditMode = !!editedItem;

  const OPTIONS_MAP: Record<PushConditionType, string> = {
    push_branch: 'Push branch',
    commit_message: 'Commit message',
    changed_files: 'File change',
  };

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues, isOpen, editedItem]);

  const conditions = watch('conditions') || [];

  const isConditionsUsed = checkIsConditionsUsed(currentTriggers, watch() as TriggerItem);

  let hasEmptyCondition = false;
  conditions.forEach(({ type, value }) => {
    if ((type !== 'push_branch' && !value) || !type) {
      hasEmptyCondition = true;
    }
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  const onAppend = () => {
    append({
      isRegex: false,
      type: '',
      value: '',
    });
  };

  const onFormCancel = () => {
    onClose();
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
          <Text textStyle="body/lg/regular" color="text/secondary" marginBlockEnd="24">
            Set up the trigger conditions that should all be met to execute the {workflows} Workflow.{' '}
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
        </DialogBody>
        <DialogFooter>
          <Button onClick={onFormCancel} variant="tertiary" marginInlineEnd="auto">
            Cancel
          </Button>
          <Tooltip
            isDisabled={!isConditionsUsed && !hasEmptyCondition}
            label={
              isConditionsUsed
                ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
                : 'Please fill all conditions.'
            }
          >
            <Button type="submit">Add trigger</Button>
          </Tooltip>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
};

export default AddTriggerDialog;
