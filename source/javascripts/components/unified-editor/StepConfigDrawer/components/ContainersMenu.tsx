import { Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';

import { Container, ContainerReference, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useNavigation from '@/hooks/useNavigation';

import { useStepDrawerContext } from '../StepConfigDrawer.context';

type ContainersMenuProps = {
  containers: Container[];
  isDisabled?: boolean;
  references?: ContainerReference[];
  type: ContainerType;
};

const ContainersMenu = (props: ContainersMenuProps) => {
  const { containers, isDisabled, references, type } = props;

  const { stepIndex, workflowId } = useStepDrawerContext();
  const { replace } = useNavigation();

  const selectedContainerIds = new Set(references?.map((ref) => ref.id) || []);
  const availableContainers = containers.filter((container) => !selectedContainerIds.has(container.id));

  return (
    <Menu>
      <MenuButton as={Button} variant="tertiary" leftIconName="Plus" size="sm" isDisabled={isDisabled}>
        Add container
      </MenuButton>
      <MenuList>
        {availableContainers.map((container) => (
          <MenuItem
            key={container.id}
            onClick={() => ContainerService.addContainerReference(workflowId, stepIndex, container.id)}
            display="flex"
            flexDir="column"
            alignItems="flex-start"
          >
            <Text>{container.id}</Text>
            <Text color="text/helper">{container.userValues.image}</Text>
          </MenuItem>
        ))}
        {availableContainers.length > 0 && <Divider color="border/minimal" mb="8" />}
        <MenuItem onClick={() => replace('/containers', { tab: type })}>Manage containers</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContainersMenu;
