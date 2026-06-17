import { Button, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';

import { TriggerType } from '@/core/models/Trigger';
import { useIsReadOnlyView } from '@/hooks/useTree';

type Props = {
  onAddTrigger: (type: TriggerType) => void;
};

const AddTriggerButton = ({ onAddTrigger }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();

  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" size="md" leftIconName="Plus" isDisabled={isReadOnlyView}>
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
