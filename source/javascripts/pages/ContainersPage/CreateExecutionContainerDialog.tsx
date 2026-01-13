import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Divider,
  Input,
  Link,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';

const CreateExecutionContainerDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const { isOpen: isShowMore, onToggle } = useDisclosure();

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
        <Collapse in={isShowMore}>
          <Box display="flex" flexDir="column" gap="16">
            <Text textStyle="heading/h3" mt="8">
              Authentication credentials
            </Text>
            <Text textStyle="body/md/regular" color="text/secondary">
              Set to access your private images with the docker login command.
            </Text>
            <Input
              label="Registry server"
              helperText="Fully qualified registry server url to used by docker login command."
              placeholder="e.g. ghcr.io"
            />
            <Input label="Username" />
            <Input label="Password" type="password" />
            <Divider />
            <Input label="Environment Variables" placeholder="Key" />
            <Input placeholder="Value" />
            <Button variant="tertiary" leftIconName="Plus" size="md">
              Add Env Var
            </Button>
          </Box>
        </Collapse>
        <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
          {isShowMore ? 'Show less options' : 'Show more options'}
        </Link>
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
