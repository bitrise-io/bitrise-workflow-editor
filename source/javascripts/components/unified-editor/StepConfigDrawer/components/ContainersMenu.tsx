import { Button, Divider, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';

import { Container } from '@/core/models/Container';

type ContainersMenuProps = {
  containers: Container[];
};

const ContainersMenu = (props: ContainersMenuProps) => {
  const { containers } = props;

  return (
    <Menu>
      <MenuButton as={Button} variant="tertiary" leftIconName="Plus" size="sm">
        Add container
      </MenuButton>
      <MenuList>
        {containers.map((container) => (
          <MenuItem key={container.id} onClick={() => {}} display="flex" flexDir="column" alignItems="flex-start">
            <Text>{container.id}</Text>
            <Text color="text/helper">{container.userValues.image}</Text>
          </MenuItem>
        ))}
        <Divider color="border/minimal" mb="8" />
        <MenuItem onClick={() => {}}>Manage containers</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContainersMenu;
