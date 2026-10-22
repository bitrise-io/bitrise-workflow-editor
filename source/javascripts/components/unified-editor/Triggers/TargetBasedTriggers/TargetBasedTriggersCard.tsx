import { ExpandableCard } from '@bitrise/bitkit';
import { BitkitButton, BitkitIconComponent, IconPlus, IconPull, IconPush, IconTag } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

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
  const TriggerIcon = ICON_MAP[triggerType];

  return (
    <ExpandableCard
      isExpanded
      padding="0"
      marginY="12"
      buttonPadding="16px 24px"
      buttonContent={
        <Box display="flex" justifyContent="flex-start">
          <TriggerIcon marginInlineEnd="8" />
          <Text textStyle="body/lg/semibold">{TYPE_MAP[triggerType]}</Text>
        </Box>
      }
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
    </ExpandableCard>
  );
};

export default TriggerCard;
