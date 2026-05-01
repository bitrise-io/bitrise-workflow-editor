import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from '@bitrise/bitkit';

const PushBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  return (
    <Dialog title="Push changes" isOpen={isOpen} onClose={onClose} as="form">
      <DialogBody>
        <RadioGroup>
          <Radio>Push to current branch</Radio>
          <Radio>Create new branch</Radio>
        </RadioGroup>
        <Input label="Target branch" helperText="Must follow git branch naming rules." mt="24" />
        <Textarea label="Commit message" helperText="Appears in your git commit history." mt="24" />
      </DialogBody>
      <DialogFooter>
        <Button variant="tertiary">Manual update</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Push changes</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PushBranchDialog;
