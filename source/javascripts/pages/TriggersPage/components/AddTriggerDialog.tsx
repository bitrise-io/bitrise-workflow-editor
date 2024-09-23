import { Button, Dialog, DialogBody, DialogFooter, Text } from '@bitrise/bitkit';

type AddTriggerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddTriggerDialog = (props: AddTriggerDialogProps) => {
  const { isOpen, onClose } = props;

  return (
    // <FormProvider {...formMethods}>
    <Dialog as="form" isOpen={isOpen} onClose={onClose} title="Add trigger" maxWidth="480">
      <DialogBody>
        <Text textStyle="body/lg/regular" color="text/secondary" marginBlockEnd="24">
          Set up the trigger conditions that should all be met to execute the WORKFLOWID Workflow.{' '}
        </Text>
        {/* {fields.map((item, index) => {
          return (
            <ConditionCard conditionNumber={index} key={item.id}>
              {index > 0 && (
                <Button leftIconName="MinusRemove" onClick={() => remove(index)} size="sm" variant="tertiary">
                  Remove
                </Button>
              )}
            </ConditionCard>
          );
        })} */}
        <Button variant="secondary" leftIconName="PlusAdd" width="100%">
          Add condition
        </Button>
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} variant="tertiary" marginInlineEnd="auto">
          Cancel
        </Button>
        {/* <Tooltip
            isDisabled={}
            label={
              isConditionsUsed
                ? 'You previously added the same set of conditions for another trigger. Please check and try again.'
                : 'Please fill all conditions.'
            }
          > */}
        <Button type="submit">Add trigger</Button>
        {/* </Tooltip> */}
      </DialogFooter>
    </Dialog>
    // </FormProvider>
  );
};

export default AddTriggerDialog;
