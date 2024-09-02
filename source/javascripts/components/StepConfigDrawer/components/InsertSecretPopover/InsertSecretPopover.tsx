import { Button, IconButton, Text } from '@bitrise/bitkit';
import {
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import { Secret } from '@/core/Secret';
import useMultiModePopover, { Mode } from '../../hooks/useMultiModePopover';
import FilterInput from '../FilterInput/FilterInput';
import { HandlerFn } from './types';
import LoadingState from './components/LoadingState';
import CreateSecret from './components/CreateSecret';

type Props = {
  size: 'sm' | 'md';
  isOpen?: boolean;
  mode?: Mode;
  isLoading?: boolean;
  secrets: Secret[];
  onOpen: VoidFunction;
  onCreate: HandlerFn;
  onSelect: HandlerFn;
};

const filterPredicate = (item: Secret, filter: string): boolean =>
  Boolean(
    item.key.toUpperCase().includes(filter.toUpperCase()) || item.source?.toUpperCase().includes(filter.toUpperCase()),
  );

const InsertSecretPopover = ({
  size,
  secrets,
  onOpen,
  onCreate,
  onSelect,
  isLoading,
  isOpen: initialIsOpen,
  mode: initialMode,
}: Props) => {
  const {
    isMode,
    switchTo,
    isOpen,
    open,
    close,
    filteredItems,
    getCreateFormProps,
    getActionListProps,
    getActionListItemProps,
    getFilterInputProps,
  } = useMultiModePopover({
    isOpen: initialIsOpen,
    mode: initialMode,
    items: secrets,
    filterPredicate,
    onOpen,
    onCreate,
    onSelect,
  });

  return (
    <Popover isLazy isOpen={isOpen} onOpen={open} onClose={close} returnFocusOnClose={false} placement="bottom-end">
      <PopoverTrigger>
        <IconButton size={size} variant="secondary" aria-label="Insert secret" iconName="Dollars" />
      </PopoverTrigger>
      <Portal>
        <PopoverContent backgroundColor="white" width="25rem" maxW="25rem" padding="16">
          <PopoverHeader
            h="32"
            marginBottom="8"
            display="flex"
            flexDir="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {isMode(Mode.CREATE) && <Text textStyle="heading/h4">Create secret</Text>}
            {isMode(Mode.SELECT) && (
              <>
                <Text textStyle="heading/h4">Insert secret</Text>
                <Button variant="tertiary" size="sm" leftIconName="PlusOpen" onClick={() => switchTo(Mode.CREATE)}>
                  Create
                </Button>
              </>
            )}
          </PopoverHeader>
          <PopoverBody>
            {isMode(Mode.CREATE) && <CreateSecret {...getCreateFormProps()} />}
            {isMode(Mode.SELECT) && (
              <>
                <FilterInput
                  {...getFilterInputProps({
                    paddingBlock: '8',
                    placeholder: 'Filter by key or source',
                  })}
                />
                {isLoading ? (
                  <LoadingState />
                ) : (
                  <List
                    {...getActionListProps({
                      maxH: '18rem',
                      overflowY: 'scroll',
                      marginInlineStart: 0,
                    })}
                  >
                    {filteredItems.length === 0 && (
                      <Text marginTop="16" marginBottom="8">
                        No secrets found
                      </Text>
                    )}
                    {filteredItems.map((ev) => (
                      <ListItem
                        key={ev.key}
                        {...getActionListItemProps(ev, {
                          padding: '8',
                        })}
                      >
                        <Text textStyle="code/lg">${ev.key}</Text>
                        <Text textStyle="body/sm/regular" color="text/secondary">
                          {ev.source}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default InsertSecretPopover;
