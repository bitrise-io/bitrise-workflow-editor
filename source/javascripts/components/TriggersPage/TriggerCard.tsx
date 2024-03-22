import { Fragment } from 'react';
import { Box, CardProps, Checkbox, Icon, IconButton, Tag, Text, Tooltip, TypeIconName } from '@bitrise/bitkit';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DraggableCard from './DraggableCard';
import { PrConditionType, PushConditionType, TagConditionType, TriggerItem } from './TriggersPage.types';

interface TriggerCardProps extends CardProps {
  isOverlay?: boolean;
  triggerItem: TriggerItem;
  onRemove?: (triggerItem: TriggerItem) => void;
  onEdit?: (triggerItem: TriggerItem) => void;
  onActiveChange?: (triggerItem: TriggerItem) => void;
}

const iconMap: Record<PushConditionType | PrConditionType | TagConditionType, TypeIconName> = {
  push_branch: 'Branch',
  commit_message: 'Commit',
  changed_files: 'Doc',
  pull_request_source_branch: 'Pull',
  pull_request_target_branch: 'Pull',
  pull_request_label: 'Tag',
  pull_request_comment: 'Chat',
  tag: 'Tag',
};

const toolTip: Record<PushConditionType | PrConditionType | TagConditionType, string> = {
  push_branch: 'Push branch',
  commit_message: 'Commit message',
  changed_files: 'File change',
  pull_request_source_branch: 'Source branch',
  pull_request_target_branch: 'Target branch',
  pull_request_label: 'PR label',
  pull_request_comment: 'PR comment',
  tag: 'Tag',
};

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
      sx={style}
      isDragging={active?.id === triggerItem.id}
      childrenWrapperStyle={{
        display: 'flex',
      }}
      isOverlay={isOverlay}
      {...rest}
    >
      <Box width="calc((100% - 190px) / 2)" paddingInlineEnd="16" display="flex" flexDir="column" gap="4">
        <Text textStyle="body/md/semibold">Trigger conditions</Text>
        <Box display="flex" alignItems="center" flexWrap="wrap" rowGap="8" columnGap="4">
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
        {isDraftPr && (
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
