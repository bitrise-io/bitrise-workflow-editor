import { Button, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';

import { TriggerType } from '@/core/models/Trigger';

type Props = {
  onAddTrigger: (triggerType: TriggerType) => void;
};

const AddTriggerButton = ({ onAddTrigger }: Props) => {
  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" size="md" leftIconName="Plus">
        Add trigger
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => onAddTrigger('push')} leftIconName="Push">
          Push
        </MenuItem>
        <MenuItem onClick={() => onAddTrigger('pull_request')} leftIconName="Pull">
          Pull request
        </MenuItem>
        <MenuItem onClick={() => onAddTrigger('tag')} leftIconName="Tag">
          Tag
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddTriggerButton;
