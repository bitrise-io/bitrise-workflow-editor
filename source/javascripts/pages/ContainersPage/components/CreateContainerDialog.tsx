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
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from '@bitrise/bitkit';
import { Controller, useForm } from 'react-hook-form';

import { EnvVarPopover } from '@/components/VariablePopover';
import { Container } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';

const CreateContainerDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  const { isOpen: isShowMore, onToggle } = useDisclosure();

  const defaultValues: Container = {
    id: '',
    userValues: {
      type: 'execution',
      image: '',
      ports: [],
      credentials: {
        server: '',
        username: '',
        password: '',
      },
      options: '',
    },
  };

  const { control, handleSubmit } = useForm<Container>({
    defaultValues,
  });

  const onSubmit = (container: Container) => {
    console.log('Form submitted:', container);
    ContainerService.createContainer(container.id, container.userValues);
    onClose();
  };

  return (
    <Dialog
      title="Create execution container"
      isOpen={isOpen}
      onClose={onClose}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <DialogBody display="flex" flexDir="column" gap="16">
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <Input
              label="Unique ID"
              helperText="The unique ID is for referencing in YAML. Allowed characters: A-Za-z0-9-_."
              placeholder="e.g. node, postgres, redis"
              isRequired
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="userValues.image"
          render={({ field }) => (
            <Input
              label="Image"
              helperText="For Docker Hub use the format of [name]:[version], for other registries use [registry server]/[owner]/[name]:[version]."
              placeholder="e.g. node:18-alpine, ghcr.io/your-github-user/your-private-image:v1.1"
              isRequired
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="userValues.ports"
          render={({ field }) => (
            <Input
              label="Ports"
              helperText="List of port mappings in the format of [HostPort01]:[ContainerPort01]. Separate multiple with commas."
              placeholder="e.g. 3000:3000, 5432:5432"
              {...field}
            />
          )}
        />
        <Collapse in={isShowMore} style={{ overflow: 'visible' }}>
          <Box display="flex" flexDir="column" gap="16">
            <Text textStyle="heading/h3" mt="8">
              Authentication credentials
            </Text>
            <Text textStyle="body/md/regular" color="text/secondary">
              Set to access your private images with the docker login command.
            </Text>
            <Controller
              control={control}
              name="userValues.credentials.server"
              render={({ field }) => (
                <Input
                  label="Registry server"
                  helperText="Fully qualified registry server url to used by docker login command."
                  placeholder="e.g. ghcr.io"
                  {...field}
                />
              )}
            />
            <Box display="flex" alignItems="flex-end" gap="8">
              <Controller
                control={control}
                name="userValues.credentials.username"
                render={({ field }) => <Input label="Username" width="100%" {...field} />}
              />
              <EnvVarPopover size="lg" onSelect={() => {}} />
            </Box>
            <Box display="flex" alignItems="flex-end" gap="8">
              <Controller
                control={control}
                name="userValues.credentials.password"
                render={({ field }) => <Input label="Password" type="password" width="100%" {...field} />}
              />
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
              <Tooltip label="Enable this if you want to replace Environment Variables in your input with the variable’s assigned value.">
                <Icon name="InfoCircle" color="icon/tertiary" size="16" ml="4" />
              </Tooltip>
            </Checkbox>
            <Button variant="tertiary" leftIconName="Plus" size="md" maxW="131">
              Add Env Var
            </Button>
            <Divider />
            <Controller
              control={control}
              name="userValues.options"
              render={({ field }) => (
                <Textarea
                  label="Docker create options"
                  helperText={
                    <>
                      Additional parameters passed to docker create command.{' '}
                      <Link colorScheme="purple" href="#" isExternal>
                        Learn more about not supported options
                      </Link>
                    </>
                  }
                  placeholder='e.g. --privileged --health-cmd "redis-cli ping" --health-interval 1s --health-timeout 3s --health-retries 2'
                  {...field}
                />
              )}
            />
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
        <Button type="submit">Create container</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateContainerDialog;
