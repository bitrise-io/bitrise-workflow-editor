import { Button, IconButton, Text } from '@bitrise/bitkit';
import {
  FocusLock,
  List,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import CreateEnvVar from './CreateEnvVar';
import LoadingState from './LoadingState';
import { EnvironmentVariable, HandlerFn } from './InsertEnvVarPopover.types';
import useMultiModePopover, { Mode } from '@/hooks/utils/useMultiModePopover';
import FilterInput from '@/components/FilterInput/FilterInput';

type Props = {
  size: 'sm' | 'md';
  isOpen?: boolean;
  mode?: Mode;
  isLoading?: boolean;
  environmentVariables: EnvironmentVariable[];
  onOpen: VoidFunction;
  onCreate: HandlerFn;
  onSelect: HandlerFn;
};

const filterPredicate = (item: EnvironmentVariable, filter: string): boolean =>
  item.key.toUpperCase().includes(filter.toUpperCase()) || item.source.toUpperCase().includes(filter.toUpperCase());

const InsertEnvVarPopover = ({
  size,
  environmentVariables,
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
    items: environmentVariables,
    filterPredicate,
    onOpen,
    onCreate,
    onSelect,
  });

  return (
    <Popover isLazy isOpen={isOpen} onOpen={open} onClose={close} returnFocusOnClose={false} placement="bottom-end">
      <PopoverTrigger>
        <IconButton size={size} variant="secondary" aria-label="Insert variable" iconName="Dollars" />
      </PopoverTrigger>
      <Portal>
        <PopoverContent backgroundColor="white" width="25rem" maxW="25rem" padding="16">
          <FocusLock autoFocus>
            <PopoverHeader
              h="32"
              marginBottom="8"
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {isMode(Mode.CREATE) && <Text textStyle="heading/h4">Create variable</Text>}
              {isMode(Mode.SELECT) && (
                <>
                  <Text textStyle="heading/h4">Insert variable</Text>
                  <Button variant="tertiary" size="sm" leftIconName="PlusOpen" onClick={() => switchTo(Mode.CREATE)}>
                    Create
                  </Button>
                </>
              )}
            </PopoverHeader>
            <PopoverBody>
              {isMode(Mode.CREATE) && <CreateEnvVar {...getCreateFormProps()} />}
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
                      })}
                    >
                      {filteredItems.length === 0 && (
                        <Text marginTop="16" marginBottom="8">
                          No env vars found
                        </Text>
                      )}
                      {filteredItems.map((ev) => (
                        <ListItem
                          {...getActionListItemProps(ev, {
                            key: ev.key,
                            padding: '8',
                          })}
                        >
                          <Text textStyle="code/lg">${ev.key}</Text>
                          <Text textStyle="body/sm/regular" color="text/secondary">
                            From {ev.source}
                          </Text>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              )}
            </PopoverBody>
          </FocusLock>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default InsertEnvVarPopover;
