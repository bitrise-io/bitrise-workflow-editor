import { Box, CardProps, Checkbox, DraggableCard, Icon, IconButton, Text } from '@bitrise/bitkit';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TriggerItem } from '../TriggersPage/TriggersPage.types';
import TriggerConditions from '../TargetBasedTriggers/TriggerConditions';

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
        <Checkbox
          marginRight="16"
          isChecked={isActive}
          onChange={() => onActiveChange && onActiveChange({ ...triggerItem, isActive: !isActive })}
        >
          Active
        </Checkbox>
        <IconButton iconName="Pencil" aria-label="Edit trigger" variant="tertiary" onClick={handleEdit} />
        <IconButton
          iconName="MinusRemove"
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
