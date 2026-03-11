import { Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';

import { Container, ContainerType } from '@/core/models/Container';
import useNavigation from '@/hooks/useNavigation';

type ContainersMenuProps = {
  actionType: 'Add' | 'Change';
  containers: Container[];
  onSelectContainer: (containerId: string) => void;
  type: ContainerType;
};

const ContainersMenu = (props: ContainersMenuProps) => {
  const { actionType, containers, onSelectContainer, type } = props;
  const { replace } = useNavigation();

  return (
    <Menu>
      <MenuButton as={Button} variant="tertiary" leftIconName={actionType === 'Add' ? 'Plus' : 'Replace'} size="sm">
        {actionType} container
      </MenuButton>
      <MenuList>
        {containers.map((container) => (
          <MenuItem
            key={container.id}
            onClick={() => onSelectContainer(container.id)}
            display="flex"
            flexDir="column"
            alignItems="flex-start"
          >
            <Text>{container.id}</Text>
            <Text color="text/helper">{container.userValues.image}</Text>
          </MenuItem>
        ))}
        {containers.length > 0 && <Divider color="border/minimal" mb="8" />}
        <MenuItem onClick={() => replace('/containers', { tab: type })}>Manage containers</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContainersMenu;
