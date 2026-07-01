import { Button, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';

import { TriggerType } from '@/core/models/Trigger';
import { useIsReadOnlyView } from '@/hooks/useTree';

type Props = {
  onAddTrigger: (type: TriggerType) => void;
};

const AddTriggerButton = ({ onAddTrigger }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();

  // Read-only views (merged config, cross-repo/ref files) can't add — show no button at all.
  if (isReadOnlyView) {
    return null;
  }

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
