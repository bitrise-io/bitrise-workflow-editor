import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Collapse,
  ControlButton,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Divider,
  Icon,
  Input,
  Link,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  Textarea,
  useDisclosure,
} from '@bitrise/bitkit';
import { useState } from 'react';

import { EnvVarPopover } from '@/components/VariablePopover';

const CreateContainerDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;

  const [image, setImage] = useState<'public' | 'private'>('public');
  const { isOpen: isShowMore, onToggle } = useDisclosure();

  return (
    <Dialog title="Create execution container" isOpen={isOpen} onClose={onClose}>
      <DialogBody display="flex" flexDir="column" gap="16">
        <SegmentedControl value={image} onChange={(value: 'public' | 'private') => setImage(value)}>
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
        {image === 'public' && (
          <>
            <Collapse in={isShowMore} style={{ overflow: 'visible' }}>
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
                <Box display="flex" alignItems="flex-end" gap="8">
                  <Input label="Username" width="100%" />
                  <EnvVarPopover size="lg" onSelect={() => {}} />
                </Box>
                <Box display="flex" alignItems="flex-end" gap="8">
                  <Input label="Password" type="password" width="100%" />
                  <EnvVarPopover size="lg" onSelect={() => {}} />
                </Box>
                <Divider />
                <Box display="flex" alignItems="flex-end" gap="10">
                  <Input label="Environment Variables" placeholder="Key" width="100%" />
                  <Input placeholder="Value" width="100%" />
                  <ButtonGroup>
                    <EnvVarPopover size="lg" onSelect={() => {}} />
                    <ControlButton iconName="Trash" size="lg" aria-label="Remove environment variable" />
                  </ButtonGroup>
                </Box>
                <Checkbox>
                  Replace variables in input
                  <Icon name="InfoCircle" color="icon/tertiary" size="16" ml="4" />
                </Checkbox>
                <Button variant="tertiary" leftIconName="Plus" size="md" maxW="131">
                  Add Env Var
                </Button>
                <Divider />
                <Textarea
                  label="Docker create options"
                  helperText="Additional parameters passed to docker create command. Learn more about not supported options"
                  placeholder='e.g. --privileged --health-cmd "redis-cli ping" --health-interval 1s --health-timeout 3s --health-retries 2'
                />
              </Box>
            </Collapse>
            <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
              {isShowMore ? 'Show less options' : 'Show more options'}
            </Link>
          </>
        )}
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

export default CreateContainerDialog;
