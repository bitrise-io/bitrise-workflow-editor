import {
  Box,
  Card,
  Checkbox,
  ControlButton,
  DefinitionTooltip,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';

import { ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useContainers from '@/hooks/useContainers';
import useNavigation from '@/hooks/useNavigation';

import { useStepDrawerContext } from '../StepConfigDrawer.context';
import useContainerReferences from '../useContainerReferences';
import ContainersMenu from './ContainersMenu';

type ContainerCardProps = {
  type: ContainerType;
};

const ContainerCard = (props: ContainerCardProps) => {
  const { type } = props;
  const { stepIndex, workflowId } = useStepDrawerContext();
  const { replace } = useNavigation();

  const executionContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Execution);
  });
  const serviceContainers = useContainers((containers) => {
    return ContainerService.getAllContainers(containers, (c) => c.userValues.type === ContainerType.Service);
  });

  const executionReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Execution);
  const serviceReferences = useContainerReferences(workflowId, stepIndex, ContainerType.Service);

  const containers = type === ContainerType.Execution ? executionContainers : serviceContainers;
  const references = type === ContainerType.Execution ? executionReferences : serviceReferences;

  const getContainerById = (containerId: string) => {
    return containers.find((c) => c.id === containerId);
  };

  const shouldShowAddButton = type === ContainerType.Service || (type === ContainerType.Execution && !references);

  return (
    <Card variant="outline" overflow="hidden">
      <Table variant="borderless" disableRowHover isFixed>
        <Thead>
          <Tr>
            <Th>
              <Text px="12">{type === 'execution' ? 'Execution' : 'Service'} Container</Text>
            </Th>
            <Th>
              <DefinitionTooltip label='By default, this step will use an already running container if any. Check "Recreate container" to destroy it and create a clean instance.'>
                Behavior
              </DefinitionTooltip>
            </Th>
            <Th width="60px" />
          </Tr>
        </Thead>
        <Tbody>
          {!!references &&
            references.map((containerId) => {
              const container = getContainerById(containerId);
              return (
                <Tr key={containerId}>
                  <Td>
                    <Text textStyle="body/md/regular" px="12" hasEllipsis>
                      {containerId}
                    </Text>
                    <Text textStyle="body/sm/regular" color="text/secondary" px="12" hasEllipsis>
                      {container?.userValues.image}
                    </Text>
                  </Td>
                  <Td>
                    <Checkbox>Recreate container</Checkbox>
                  </Td>
                  <Td width="60px">
                    <Box display="flex" justifyContent="center" pr="12">
                      <ControlButton aria-label="Delete container" iconName="MinusCircle" color="icon/negative" />
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          <Tr>
            <Td>
              {!containers.length ? (
                <Text textStyle="body/md/regular" color="text/secondary">
                  No {type} containers available.{' '}
                  <Link colorScheme="purple" onClick={() => replace('/containers', { tab: type })}>
                    Manage {type} containers
                  </Link>
                </Text>
              ) : (
                <>
                  {shouldShowAddButton ? (
                    <ContainersMenu containers={containers} type={type} />
                  ) : (
                    <Text textStyle="body/md/regular" color="text/secondary">
                      You can only add one execution container per Step.
                    </Text>
                  )}
                </>
              )}
            </Td>
            <Td />
            <Td />
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
};

export default ContainerCard;
