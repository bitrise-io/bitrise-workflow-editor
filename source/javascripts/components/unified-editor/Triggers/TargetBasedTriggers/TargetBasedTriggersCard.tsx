import { Box, Button, ExpandableCard, Icon, Text } from '@bitrise/bitkit';

import { TargetBasedTrigger, TriggerType, TYPE_MAP } from '@/core/models/Trigger';

import TargetBasedTriggerItem from './TargerBasedTriggerItem';

type Props = {
  triggerType: TriggerType;
  triggers: TargetBasedTrigger[];
  triggersEnabled: boolean;
  onAddTrigger: (triggerType: TriggerType) => void;
  onEditTrigger: (trigger: TargetBasedTrigger) => void;
  onDeleteTrigger: (trigger: TargetBasedTrigger) => void;
  onUpdateTriggerEnabled: (trigger: TargetBasedTrigger) => void;
};

const TriggerCard = ({
  triggerType,
  triggers,
  triggersEnabled,
  onAddTrigger,
  onEditTrigger,
  onDeleteTrigger,
  onUpdateTriggerEnabled,
}: Props) => {
  return (
    <ExpandableCard
      isExpanded
      padding="0"
      marginY="12"
      buttonPadding="16px 24px"
      buttonContent={
        <Box display="flex" justifyContent="flex-start">
          <Icon name="Push" marginRight={8} />
          <Text textStyle="body/lg/semibold">{TYPE_MAP[triggerType]}</Text>
        </Box>
      }
    >
      {triggers.map((trigger: TargetBasedTrigger) => (
        <TargetBasedTriggerItem
          key={trigger.uniqueId}
          trigger={trigger}
          triggersEnabled={triggersEnabled}
          onEditTrigger={onEditTrigger}
          onDeleteTrigger={onDeleteTrigger}
          onUpdateEnabled={onUpdateTriggerEnabled}
        />
      ))}
      <Button margin="12" size="md" variant="tertiary" leftIconName="Plus" onClick={() => onAddTrigger(triggerType)}>
        Add trigger
      </Button>
    </ExpandableCard>
  );
};

export default TriggerCard;
