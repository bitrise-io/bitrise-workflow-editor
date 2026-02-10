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
  Notification,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from '@bitrise/bitkit';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';
import { EnvVarPopover } from '@/components/VariablePopover';
import { Container } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';

type CreateOrEditContainerDialogProps = Omit<DialogProps, 'title'> & {
  editedContainer: Container | null;
  setEditedContainer: Dispatch<SetStateAction<Container | null>>;
  type: 'execution' | 'service';
};

type FormData = Omit<Container, 'userValues'> & {
  userValues: Omit<Container['userValues'], 'ports'> & {
    ports: string;
  };
};

const CreateOrEditContainerDialog = (props: CreateOrEditContainerDialogProps) => {
  const { editedContainer, isOpen, onClose, setEditedContainer, type } = props;

  const containerIds = useContainers((s) => Object.keys(s));
  const { isOpen: isShowMore, onToggle } = useDisclosure();

  const { control, formState, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      id: '',
      userValues: {
        type,
        image: '',
        ports: '',
        credentials: {
          server: '',
          username: '',
          password: '',
        },
        options: '',
      },
    },
    mode: 'onChange',
  });

  const onSubmit = (formData: FormData) => {
    const convertedPorts = formData.userValues.ports
      .split(',')
      .map((port) => port.trim())
      .filter((port) => port !== '')
      .map((port) => ContainerService.sanitizePort(port));
    const container: Container = {
      ...formData,
      userValues: {
        ...formData.userValues,
        ports: convertedPorts,
      },
    };

    if (editedContainer) {
      if (container.id !== editedContainer.id) {
        ContainerService.updateContainerId(editedContainer.id, container.id);
      }
      ContainerService.updateContainer(container.id, container.userValues);
    } else {
      ContainerService.createContainer(container.id, container.userValues);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const formData: FormData = {
        id: editedContainer?.id || '',
        userValues: {
          type,
          image: editedContainer?.userValues.image || '',
          ports: editedContainer?.userValues.ports?.join(', ') || '',
          credentials: {
            server: editedContainer?.userValues.credentials?.server || '',
            username: editedContainer?.userValues.credentials?.username || '',
            password: editedContainer?.userValues.credentials?.password || '',
          },
          options: editedContainer?.userValues.options || '',
        },
      };
      reset(formData);
    } else {
      setEditedContainer(null);
    }
  }, [isOpen, editedContainer, type, reset, setEditedContainer]);

  return (
    <Dialog
      title={editedContainer ? `Edit ${type} container` : `Create ${type} container`}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <DialogBody display="flex" flexDir="column" gap="16">
        <Controller
          control={control}
          name="id"
          rules={{
            validate: (value) => ContainerService.validateName(value, editedContainer?.id || '', containerIds),
          }}
          render={({ field: { onChange, ...fieldProps } }) => (
            <Input
              label="Unique ID"
              helperText="The unique ID is for referencing in YAML. Allowed characters: A-Za-z0-9-_."
              placeholder="e.g. node, postgres, redis"
              errorText={formState.errors.id?.message}
              isRequired
              data-1p-ignore
              onChange={(e) => {
                const sanitizedValue = ContainerService.sanitizeName(e.target.value);
                onChange(sanitizedValue);
              }}
              {...fieldProps}
            />
          )}
        />
        <Controller
          control={control}
          name="userValues.image"
          rules={{ required: 'Image is required' }}
          render={({ field }) => (
            <Input
              label="Image"
              helperText="For Docker Hub use the format of [name]:[version], for other registries use [registry server]/[owner]/[name]:[version]."
              placeholder="e.g. node:18-alpine, ghcr.io/your-github-user/your-private-image:v1.1"
              errorText={formState.errors.userValues?.image?.message}
              isRequired
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="userValues.ports"
          rules={{
            validate: (ports) => {
              const convertedPorts =
                ports === ''
                  ? []
                  : ports
                      .split(',')
                      .map((port) => port.trim())
                      .filter((port) => port !== '');
              return ContainerService.validatePorts(convertedPorts);
            },
          }}
          render={({ field }) => (
            <Input
              label="Ports"
              helperText="List of port mappings in the format of [HostPort01]:[ContainerPort01]. Separate multiple with commas."
              placeholder="e.g. 3000:3000, 5432:5432"
              errorText={formState.errors.userValues?.ports?.message}
              {...field}
            />
          )}
        />
        <Collapse in={isShowMore} style={{ overflow: 'visible' }}>
          <Box display="flex" flexDir="column" gap="16">
            <Text textStyle="heading/h3" mt="8">
              Authentication credentials
            </Text>
            <Notification status="info">
              <Text textStyle="comp/notification/title" mb="2">
                Authentication recommended
              </Text>
              <Text textStyle="body/md/regular">
                Authenticate to pull private images and avoid rate limits issues. Add credentials here (Bitrise CLI runs
                docker login automatically) or use an OAuth Step.
              </Text>
              <Text textStyle="body/md/regular">
                <Link href="https://docs.bitrise.io" isExternal isUnderlined>
                  Learn more
                </Link>
              </Text>
            </Notification>
            <Controller
              control={control}
              name="userValues.credentials.server"
              render={({ field }) => (
                <Input
                  label="Registry server"
                  helperText="Fully qualified registry server URL to be used by docker login command."
                  placeholder="e.g. ghcr.io"
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="userValues.credentials.username"
              render={({ field }) => <StepInput label="Username" isSensitive size="lg" {...field} />}
            />
            <Controller
              control={control}
              name="userValues.credentials.password"
              render={({ field }) => <StepInput label="Password" isSensitive size="lg" {...field} />}
            />
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
                      <Link colorScheme="purple" href="https://docs.bitrise.io" isExternal>
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
        <Button type="submit" isDisabled={!formState.isValid || !formState.isDirty}>
          {editedContainer ? 'Save' : 'Create container'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateOrEditContainerDialog;
