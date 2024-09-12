import {
  Box,
  CardProps,
  ControlButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';
import { TriggerItem, toolTip, iconMap } from '../../../../TriggersPage/TriggersPage.types';

interface NewTriggerCardProps extends CardProps {
  isOverlay?: boolean;
  triggerItem: TriggerItem;
  onRemove?: (triggerItem: TriggerItem) => void;
  onEdit?: (triggerItem: TriggerItem) => void;
  onActiveChange?: (triggerItem: TriggerItem) => void;
}

const NewTriggerCard = (props: NewTriggerCardProps) => {
  const { isOverlay, triggerItem, onRemove, onEdit, onActiveChange, ...rest } = props;
  const { conditions, pipelineable, isDraftPr, isActive } = triggerItem;

  const handleRemove = () => {
    if (onRemove) {
      onRemove(triggerItem);
    }
  };

  return (
    <Box
      borderBottom="1px solid"
      borderColor="border/minimal"
      margin="-16px -16px 24px -16px"
      padding="24px"
      width="calc(100% + 32px)"
      display="flex"
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center" flexGrow={1}>
        {(!conditions || conditions.length === 0) && <Tag size="sm">No conditions.</Tag>}
        {conditions.map(({ type, value }, index) => (
          <Fragment key={type + value}>
            <Tooltip label={toolTip[type]}>
              <Tag iconName={iconMap[type]} iconColor="neutral.60" size="sm">
                {value}
              </Tag>
            </Tooltip>
            {conditions.length - 1 > index && (
              <Text as="span" marginX="4">
                and
              </Text>
            )}
          </Fragment>
        ))}
      </Box>
      <Menu placement="bottom-end">
        <MenuButton aria-label="Open menu" as={ControlButton} iconName="MoreVertical" isTooltipDisabled size="sm" />
        <MenuList>
          <MenuItem as="a" href="/edit-trigger" iconName="Pencil">
            Edit trigger
          </MenuItem>
          <MenuItem as="a" href="/delete-trigger" iconName="Trash" isDanger onClick={handleRemove}>
            Delete trigger
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default NewTriggerCard;
