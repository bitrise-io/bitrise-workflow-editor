import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Input,
  SegmentedControl,
  SegmentedControlItem,
} from '@bitrise/bitkit';

const CreateExecutionContainerDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  return (
    <Dialog title="Create execution container" isOpen={isOpen} onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="16">
        <SegmentedControl>
          <SegmentedControlItem value="public">Public image</SegmentedControlItem>
          <SegmentedControlItem value="private">Private image</SegmentedControlItem>
        </SegmentedControl>
        <Input
          label="Unique ID"
          helperText="The unique ID is for referencing in YAML. Allowed characters: A-Za-z0-9-_."
          placeholder="e.g. node, postgres, redis"
          isRequired
        />
        <Input
          label="Image"
          helperText="For Docker Hub use the format of [name]:[version], for other registries use [registry server]/[owner]/[name]:[version]."
          placeholder="e.g. node:18-alpine, ghcr.io/your-github-user/your-private-image:v1.1"
          isRequired
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button>Create container</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateExecutionContainerDialog;
