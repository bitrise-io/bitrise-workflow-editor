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
} from 'chakra-ui-2--react';
import { useState } from 'react';

import useMultiModePopover, { Mode } from '@/components/VariablePopover/hooks/useMultiModePopover';
import { Secret } from '@/core/models/Secret';
import PageProps from '@/core/utils/PageProps';
import { useSecrets, useUpsertSecret } from '@/hooks/useSecrets';

import CreateSecret from './components/CreateSecret';
import FilterInput from './components/FilterInput';
import LoadingState from './components/LoadingState';

type Props = {
  size: 'sm' | 'md';
  isOpen?: boolean;
  mode?: Mode;
  onSelect: (item: Secret) => void;
};

const filterPredicate = (item: Secret, filter: string): boolean =>
  Boolean(
    item.key.toUpperCase().includes(filter.toUpperCase()) || item.source?.toUpperCase().includes(filter.toUpperCase()),
  );

const SecretPopover = ({ size, onSelect, isOpen: initialIsOpen, mode: initialMode }: Props) => {
  const appSlug = PageProps.appSlug();
  const [shouldLoadVars, setShouldLoadVars] = useState(Boolean(initialIsOpen));
  const { isLoading, data: secrets = [] } = useSecrets({
    appSlug,
    options: { enabled: shouldLoadVars },
  });

  const { mutate: createSecret } = useUpsertSecret({
    appSlug: PageProps.appSlug(),
    options: {
      onSuccess: (data) => {
        if (data) {
          onSelect(data);
        }
      },
    },
  });

  const {
    isOpen,
    filteredItems,
    open,
    close,
    isMode,
    switchTo,
    getCreateFormProps,
    getActionListProps,
    getFilterInputProps,
    getActionListItemProps,
  } = useMultiModePopover({
    items: secrets,
    mode: initialMode,
    isOpen: initialIsOpen,
    onCreate: createSecret,
    onSelect,
    filterPredicate,
    onOpen: () => setShouldLoadVars(true),
    onClose: () => setShouldLoadVars(false),
  });

  return (
    <Popover isLazy isOpen={isOpen} onOpen={open} onClose={close} returnFocusOnClose={false} placement="bottom-end">
      <PopoverTrigger>
        <IconButton
          size={size}
          iconName="Dollars"
          variant="secondary"
          aria-label="Insert secret"
          tooltipProps={{ 'aria-label': 'Insert secret' }}
        />
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
                <Button variant="tertiary" size="sm" leftIconName="Plus" onClick={() => switchTo(Mode.CREATE)}>
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

export default SecretPopover;
