import { Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';

import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import useNavigation from '@/hooks/useNavigation';

import { useStepDrawerContext } from '../StepConfigDrawer.context';

type ContainersMenuProps = {
  containers: Container[];
  type: ContainerType;
};

const ContainersMenu = (props: ContainersMenuProps) => {
  const { containers, type } = props;

  const { stepIndex, workflowId } = useStepDrawerContext();
  const { replace } = useNavigation();

  return (
    <Menu>
      <MenuButton as={Button} variant="tertiary" leftIconName="Plus" size="sm">
        Add container
      </MenuButton>
      <MenuList>
        {containers.map((container) => (
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
        <Divider color="border/minimal" mb="8" />
        <MenuItem onClick={() => replace('/containers', { tab: type })}>Manage containers</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContainersMenu;
