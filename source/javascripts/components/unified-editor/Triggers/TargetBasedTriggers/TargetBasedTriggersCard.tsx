import {
  BitkitButton,
  BitkitExpandableCard,
  BitkitIconComponent,
  IconPlus,
  IconPull,
  IconPush,
  IconTag,
} from '@bitrise/bitkit-v2';

import { TargetBasedTrigger, TriggerType, TYPE_MAP } from '@/core/models/Trigger';

import TargetBasedTriggerItem from './TargetBasedTriggerItem';

const ICON_MAP: Record<TriggerType, BitkitIconComponent> = {
  push: IconPush,
  pull_request: IconPull,
  tag: IconTag,
};

type Props = {
  triggerType: TriggerType;
  triggers: TargetBasedTrigger[];
  triggersEnabled: boolean;
  isReadOnly: boolean;
  onAddTrigger: (triggerType: TriggerType) => void;
  onEditTrigger: (trigger: TargetBasedTrigger) => void;
  onDeleteTrigger: (trigger: TargetBasedTrigger) => void;
  onUpdateTriggerEnabled: (trigger: TargetBasedTrigger) => void;
};

const TriggerCard = ({
  triggerType,
  triggers,
  triggersEnabled,
  isReadOnly,
  onAddTrigger,
  onEditTrigger,
  onDeleteTrigger,
  onUpdateTriggerEnabled,
}: Props) => {
  return (
    <BitkitExpandableCard
      defaultExpanded
      elevation={false}
      icon={ICON_MAP[triggerType]}
      marginBlock="12"
      noPadding
      title={TYPE_MAP[triggerType]}
    >
      {triggers.map((trigger: TargetBasedTrigger) => (
        <TargetBasedTriggerItem
          key={trigger.uniqueId}
          trigger={trigger}
          triggersEnabled={triggersEnabled}
          isReadOnly={isReadOnly}
          onEditTrigger={onEditTrigger}
          onDeleteTrigger={onDeleteTrigger}
          onUpdateEnabled={onUpdateTriggerEnabled}
        />
      ))}
      {!isReadOnly && (
        <BitkitButton
          margin="12"
          size="md"
          variant="tertiary"
          icon={IconPlus}
          onClick={() => onAddTrigger(triggerType)}
        >
          Add trigger
        </BitkitButton>
      )}
    </BitkitExpandableCard>
  );
};

export default TriggerCard;
