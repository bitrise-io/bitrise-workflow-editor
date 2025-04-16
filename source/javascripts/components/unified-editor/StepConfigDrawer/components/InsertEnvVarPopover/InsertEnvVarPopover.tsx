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
import { useState } from 'react';

import { EnvVar } from '@/core/models/EnvVar';
import PageProps from '@/core/utils/PageProps';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';

import useMultiModePopover, { Mode } from '../../hooks/useMultiModePopover';
import FilterInput from '../FilterInput/FilterInput';
import CreateEnvVar from './components/CreateEnvVar';
import LoadingState from './components/LoadingState';
import { HandlerFn } from './types';

type Props = {
  size: 'sm' | 'md';
  isOpen?: boolean;
  mode?: Mode;
  onCreate: HandlerFn;
  onSelect: HandlerFn;
  stepBundleId?: string;
  workflowId: string;
};

const filterPredicate = (item: EnvVar, filter: string): boolean =>
  item.key.toUpperCase().includes(filter.toUpperCase()) || item.source.toUpperCase().includes(filter.toUpperCase());

const InsertEnvVarPopover = ({
  size,
  onCreate,
  onSelect,
  isOpen: initialIsOpen,
  mode: initialMode,
  stepBundleId,
  workflowId,
}: Props) => {
  const appSlug = PageProps.appSlug();
  const [shouldLoadVars, setShouldLoadVars] = useState(Boolean(initialIsOpen));
  const { isLoading: isLoadingEnvVars, envs } = useEnvVars({
    stepBundleIds: stepBundleId ? [stepBundleId] : [],
    workflowIds: [workflowId],
    enabled: shouldLoadVars,
  });
  const { isLoading: isLoadingSecrets, data: secrets = [] } = useSecrets({
    appSlug,
    options: { enabled: shouldLoadVars },
  });

  const isLoading = isLoadingEnvVars || isLoadingSecrets;
  const items = [...envs, ...secrets] as EnvVar[];
  items.sort((a, b) => a.key.localeCompare(b.key));

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
    items,
    mode: initialMode,
    isOpen: initialIsOpen,
    onSelect,
    onCreate,
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
          aria-label="Insert variable"
          tooltipProps={{ 'aria-label': 'Insert variable' }}
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
            {isMode(Mode.CREATE) && <Text textStyle="heading/h4">Create variable</Text>}
            {isMode(Mode.SELECT) && (
              <>
                <Text textStyle="heading/h4">Insert variable</Text>
                <Button variant="tertiary" size="sm" leftIconName="Plus" onClick={() => switchTo(Mode.CREATE)}>
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
                      marginInlineStart: 0,
                    })}
                  >
                    {filteredItems.length === 0 && (
                      <Text marginTop="16" marginBottom="8">
                        No env vars found
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

export default InsertEnvVarPopover;
