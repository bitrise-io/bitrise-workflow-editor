import { Box, CardProps, Checkbox, DraggableCard, Icon, IconButton, Text } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TriggerConditions from '@/components/unified-editor/Triggers/TriggerConditions';
import { trackTriggerEnabledToggled } from '@/core/analytics/TriggerAnalytics';
import { TriggerSource } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';

interface TriggerCardProps extends CardProps {
  isOverlay?: boolean;
  triggerItem: LegacyTrigger;
  onRemove?: (triggerItem: LegacyTrigger) => void;
  onEdit?: (triggerItem: LegacyTrigger) => void;
  onActiveChange?: (triggerItem: LegacyTrigger) => void;
}

const TriggerCard = (props: TriggerCardProps) => {
  const { isOverlay, triggerItem, onRemove, onEdit, onActiveChange, ...rest } = props;
  const { conditions, source, isDraftPr, isActive } = triggerItem;
  const [target, targetId] = source.split('#') as [TriggerSource, string];

  const { active, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: triggerItem.uniqueId,
  });

  const style: CardProps = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(triggerItem);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(triggerItem);
    }
  };

  const handleActiveChange = () => {
    if (onActiveChange) {
      const newTriggerItem = { ...triggerItem, isActive: !isActive };
      onActiveChange(newTriggerItem);
      trackTriggerEnabledToggled(newTriggerItem, 'trigger_map');
    }
  };

  return (
    <DraggableCard
      activatorRef={setActivatorNodeRef}
      activatorListeners={listeners}
      ref={setNodeRef}
      marginBottom="12"
      isDragging={active?.id === triggerItem.uniqueId}
      isOverlay={isOverlay}
      {...style}
      {...rest}
    >
      <Box width="calc((100% - 190px) / 2)" paddingInlineEnd="16" display="flex" flexDir="column" gap="4">
        <Text textStyle="body/md/semibold">Trigger conditions</Text>
        <TriggerConditions conditions={conditions} isDraftPr={isDraftPr} triggerType={triggerItem.triggerType} />
      </Box>
      <Box width="calc((100% - 190px) / 2)" paddingInlineEnd="16" display="flex" alignItems="center">
        <Icon name="ArrowRight" marginRight="16" />
        <Box display="flex" flexDir="column" gap="4">
          <Text>{targetId}</Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            {target === 'workflows' ? 'Workflow' : 'Pipeline'}
          </Text>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <Checkbox marginRight="16" isChecked={isActive} onChange={() => handleActiveChange()}>
          Active
        </Checkbox>
        <IconButton iconName="Pencil" aria-label="Edit trigger" variant="tertiary" onClick={handleEdit} />
        <IconButton
          iconName="MinusCircle"
          aria-label="Remove trigger"
          variant="tertiary"
          isDanger
          onClick={handleRemove}
        />
      </Box>
    </DraggableCard>
  );
};

export default TriggerCard;
