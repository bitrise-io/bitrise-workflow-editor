import { Fragment } from 'react';
import { Box, CardProps, Checkbox, DraggableCard, Icon, IconButton, Tag, Text, Tooltip } from '@bitrise/bitkit';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TriggerItem, iconMap, toolTip } from './TriggersPage.types';

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
        <Box display="flex" alignItems="center" flexWrap="wrap" rowGap="8" columnGap="4">
          {(!conditions || conditions.length === 0) && <Tag size="sm">No conditions.</Tag>}
          {conditions.map(({ type, value }, index) => (
            <Fragment key={type + value}>
              <Tooltip label={toolTip[type]}>
                <Tag iconName={iconMap[type]} iconColor="neutral.60" size="sm">
                  {value}
                </Tag>
              </Tooltip>
              {conditions.length - 1 > index && <Text as="span">+</Text>}
            </Fragment>
          ))}
        </Box>
        {isDraftPr === false && (
          <Text textStyle="body/md/regular" color="text/tertiary">
            Draft PRs excluded
          </Text>
        )}
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
