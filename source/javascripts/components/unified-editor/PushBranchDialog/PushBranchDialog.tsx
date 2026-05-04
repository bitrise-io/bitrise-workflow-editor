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
import { useState } from 'react';

const PushBranchDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const [branchType, setBranchType] = useState<'current' | 'new'>('current');

  return (
    <Dialog title="Push changes" isOpen={isOpen} onClose={onClose} as="form">
      <DialogBody>
        <RadioGroup
          display="flex"
          gap="24"
          value={branchType}
          onChange={(value) => setBranchType(value as 'current' | 'new')}
        >
          <Radio value="current">Push to current branch</Radio>
          <Radio value="new">Create new branch</Radio>
        </RadioGroup>
        <Input
          label="Target branch"
          placeholder="new-branch-name"
          helperText="Must follow git branch naming rules."
          isRequired
          mt="24"
        />
        <Textarea
          label="Commit message"
          placeholder="e.g. Update Bitrise configuration via Workflow Editor"
          helperText="Appears in your git commit history."
          isRequired
          mt="24"
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="tertiary" mr="auto">
          Manual update
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Push changes</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PushBranchDialog;
