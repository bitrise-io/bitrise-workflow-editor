import { Box, CardProps, Checkbox, DraggableCard, Icon, IconButton, Text } from '@bitrise/bitkit';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { segmentTrack } from '@/utils/segmentTracking';
import { TriggerItem } from '@/components/unified-editor/Triggers/Triggers.types';
import TriggerConditions from '@/components/unified-editor/Triggers/components/TriggerConditions';

interface TriggerCardProps extends CardProps {
  isOverlay?: boolean;
  triggerItem: TriggerItem;
  onRemove?: (triggerItem: TriggerItem) => void;
  onEdit?: (triggerItem: TriggerItem) => void;
  onActiveChange?: (triggerItem: TriggerItem) => void;
}

const TriggerCard = (props: TriggerCardProps) => {
  const { isOverlay, triggerItem, onRemove, onEdit, onActiveChange, ...rest } = props;
  const { conditions, pipelineable, isDraftPr, isActive } = triggerItem;

  const { active, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: triggerItem.id as string,
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
      onActiveChange({ ...triggerItem, isActive: !isActive });
      segmentTrack('Workflow Editor Enable Trigger Toggled', {
        is_selected_trigger_enabled: isActive === true,
        trigger_origin: 'trigger_map',
      });
    }
  };

  return (
    <DraggableCard
      activatorRef={setActivatorNodeRef}
      activatorListeners={listeners}
      ref={setNodeRef}
      marginBottom="12"
      isDragging={active?.id === triggerItem.id}
      isOverlay={isOverlay}
      {...style}
      {...rest}
    >
      <Box width="calc((100% - 190px) / 2)" paddingInlineEnd="16" display="flex" flexDir="column" gap="4">
        <Text textStyle="body/md/semibold">Trigger conditions</Text>
        <TriggerConditions conditions={conditions} isDraftPr={isDraftPr} />
      </Box>
      <Box width="calc((100% - 190px) / 2)" paddingInlineEnd="16" display="flex" alignItems="center">
        <Icon name="ArrowRight" marginRight="16" />
        <Box display="flex" flexDir="column" gap="4">
          <Text textStyle="body/md/semibold">Start build</Text>
          <Text>{pipelineable.replace('#', ': ')}</Text>
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
