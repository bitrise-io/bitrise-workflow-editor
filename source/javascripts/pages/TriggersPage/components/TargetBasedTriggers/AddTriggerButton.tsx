import { BitkitActionMenu, BitkitButton, IconPlus, IconPull, IconPush, IconTag } from '@bitrise/bitkit-v2';

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
    <BitkitActionMenu
      data-clarity-unmask="true"
      trigger={
        <BitkitButton variant="secondary" size="md" icon={IconPlus} data-clarity-unmask="true">
          Add trigger
        </BitkitButton>
      }
    >
      <BitkitActionMenu.Item icon={IconPush} onClick={() => onAddTrigger('push')}>
        Push
      </BitkitActionMenu.Item>
      <BitkitActionMenu.Item icon={IconPull} onClick={() => onAddTrigger('pull_request')}>
        Pull request
      </BitkitActionMenu.Item>
      <BitkitActionMenu.Item icon={IconTag} onClick={() => onAddTrigger('tag')}>
        Tag
      </BitkitActionMenu.Item>
    </BitkitActionMenu>
  );
};

export default AddTriggerButton;
