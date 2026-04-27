import { Button, Dialog, DialogBody, DialogFooter, DialogProps, Select, Text } from '@bitrise/bitkit';

const SwitchBranchDialog = (props: DialogProps) => {
  const { isOpen, onClose } = props;

  return (
    <Dialog title="Switch branch" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <Text>Load configuration from another branch.</Text>
        <Select placeholder="Select branch" mt="24" />
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
