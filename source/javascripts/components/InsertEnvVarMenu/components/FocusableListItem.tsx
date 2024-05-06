import { ListItem } from '@chakra-ui/react';
import { Text } from '@bitrise/bitkit';
import { EnvironmentVariable, HandlerFn } from '../types';

type FocusableListItemProps = {
  ev: EnvironmentVariable;
  index: number;
  onSelect: HandlerFn;
  onKeyDown: (event: React.KeyboardEvent, idx: number) => void;
};

const FocusableListItem = ({ ev, index, onSelect, onKeyDown }: FocusableListItemProps) => (
  <ListItem
    tabIndex={0}
    padding="8"
    onClick={() => onSelect(ev)}
    outline="none"
    _focus={{ backgroundColor: 'background/hover' }}
    _focusVisible={{ boxShadow: 'none' }}
    _hover={{ backgroundColor: 'background/hover' }}
    onKeyDown={(event) => onKeyDown(event, index)}
  >
    <Text textStyle="code/lg">${ev.key}</Text>
    <Text textStyle="body/sm/regular" color="text/secondary">
      From {ev.source}
    </Text>
  </ListItem>
);

export default FocusableListItem;
