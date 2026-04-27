import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Select, Text } from '@bitrise/bitkit';

const SwitchBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  return (
    <Dialog title="Switch branch" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <Text>Load configuration from selected branch.</Text>
        <Select label="Branch" placeholder="Select branch" isRequired mt="24" />
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button>Switch</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SwitchBranchDialog;
