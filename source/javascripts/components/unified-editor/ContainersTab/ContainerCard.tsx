import {
  Box,
  Card,
  Checkbox,
  ControlButton,
  DefinitionTooltip,
  Icon,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';

import { Container, ContainerReference, ContainerType } from '@/core/models/Container';
import useNavigation from '@/hooks/useNavigation';

import ContainersMenu from './ContainersMenu';

type ContainerCardProps = {
  containers: Container[];
  onAddContainer: (containerId: string) => void;
  onRecreate: (containerId: string, recreate: boolean) => void;
  onRemove: (containerId: string) => void;
  references?: ContainerReference[];
  type: ContainerType;
};

const ContainerCard = (props: ContainerCardProps) => {
  const { containers, onAddContainer, onRecreate, onRemove, references, type } = props;
  const { replace } = useNavigation();

  const getContainerById = (containerId: string) => {
    return containers.find((c) => c.id === containerId);
  };

  const shouldShowAddButton =
    type === ContainerType.Service || (type === ContainerType.Execution && references?.length !== 1);

  const selectedReferenceIds = new Set(references?.map((ref) => ref.id) || []);
  const availableContainers = containers.filter((container) => !selectedReferenceIds.has(container.id));

  // const handleRecreate = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const isChecked = e.target.checked;
  //   const containerId = e.target.value;
  //   ContainerService.updateContainerReferenceRecreate(workflowId, stepIndex, type, containerId, isChecked);
  // };

  return (
    <Card variant="outline" overflow="hidden">
      <Table variant="borderless" disableRowHover isFixed>
        <Thead>
          <Tr>
            <Th>
              <Text px="12" color="text/primary">
                {type === 'execution' ? 'Execution' : 'Service'} Container
              </Text>
            </Th>
            <Th color="text/primary">
              <DefinitionTooltip label='By default, this step will use an already running container if any. Check "Recreate container" to destroy it and create a clean instance.'>
                Behavior
              </DefinitionTooltip>
            </Th>
            <Th width="60px" />
          </Tr>
        </Thead>
        <Tbody>
          {!!references &&
            references.map((reference) => {
              const container = getContainerById(reference.id);
              return (
                <Tr key={reference.id}>
                  <Td>
                    <Text textStyle="body/md/regular" color="text/body" px="12" hasEllipsis>
                      {reference.id}
                    </Text>
                    <Text textStyle="body/sm/regular" color="text/secondary" px="12" hasEllipsis>
                      {container?.userValues.image}
                    </Text>
                  </Td>
                  <Td>
                    <Checkbox
                      isChecked={reference.recreate}
                      onChange={(e) => onRecreate(reference.id, e.target.checked)}
                      value={reference.id}
                    >
                      Recreate container
                    </Checkbox>
                  </Td>
                  <Td width="60px">
                    <Box display="flex" justifyContent="center" pr="12">
                      <ControlButton
                        aria-label="Delete container"
                        iconName="MinusCircle"
                        color="icon/negative"
                        onClick={() => onRemove(reference.id)}
                      />
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          <Tr>
            {!containers.length ? (
              <Td colSpan={3}>
                <Text textStyle="body/md/regular" color="text/secondary" pl="12">
                  No {type} containers available.{' '}
                  <Link colorScheme="purple" onClick={() => replace('/containers', { tab: type })}>
                    Manage {type} containers
                  </Link>
                </Text>
              </Td>
            ) : (
              <>
                {shouldShowAddButton ? (
                  <>
                    <Td>
                      <ContainersMenu containers={availableContainers} onAddContainer={onAddContainer} type={type} />
                    </Td>
                    <Td />
                    <Td />
                  </>
                ) : (
                  <Td colSpan={3}>
                    <Box display="flex" alignItems="center" gap="4" pl="4">
                      <Icon name="InfoCircle" color="icon/tertiary" size="16" />
                      <Text textStyle="body/md/regular" color="text/secondary">
                        You can only add one execution container per Step.
                      </Text>
                    </Box>
                  </Td>
                )}
              </>
            )}
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
};

export default ContainerCard;
