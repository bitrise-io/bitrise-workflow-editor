import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Text } from '@bitrise/bitkit';
import {
  FocusLock,
  List,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import FilterInput from '../FilterInput/FilterInput';
import { EnvironmentVariable, HandlerFn } from './types';
import CreateEnvVar from './components/CreateEnvVar';
import LoadingState from './components/LoadingState';
import { filterEnvVars } from './utils';
import FocusableListItem from './components/FocusableListItem';

enum Mode {
  CREATE = 'create',
  SELECT = 'select',
}

type Props = {
  size: 'sm' | 'md';
  isLoading?: boolean;
  onOpen: VoidFunction;
  environmentVariables: EnvironmentVariable[];
  onCreate: HandlerFn;
  onSelect: HandlerFn;
};

const InsertEnvVarMenu = ({
  size,
  environmentVariables,
  onOpen: openCallback,
  onCreate,
  onSelect,
  isLoading,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const filterRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState('');
  const filteredEnvVars = useMemo(() => filterEnvVars(environmentVariables, filter), [environmentVariables, filter]);
  const [menuMode, changeMenuMode] = useState<Mode>(Mode.SELECT);
  const isCreateMode = menuMode === Mode.CREATE;
  const isSelectMode = menuMode === Mode.SELECT;

  const handleOpen = () => {
    changeMenuMode(Mode.SELECT);
    setFilter('');
    onOpen();
    openCallback();
    setTimeout(() => {
      filterRef.current?.focus();
    }, 50);
  };

  const handleClose = () => {
    onClose();
  };

  const switchToCreateMode = () => {
    changeMenuMode(Mode.CREATE);
  };

  const handleCreateEnvVar = (envVar: EnvironmentVariable) => {
    onCreate(envVar);
    onClose();
  };

  const handleCancelEnvVarCreate = () => {
    changeMenuMode(Mode.SELECT);
  };

  const handleSelectEnvVar = (envVar: EnvironmentVariable) => {
    onSelect(envVar);
    onClose();
  };

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || !filterRef.current || event.target === filterRef.current) {
        return;
      }

      if (/^[a-zA-Z0-9_]$/.test(event.key)) {
        filterRef.current.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleDocumentKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent, idx: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const listLength = filteredEnvVars.length;
      // Loop over index
      const nextIndex = event.key === 'ArrowDown' ? (idx + 1) % listLength : (idx - 1 + listLength) % listLength;
      const nextItem = listRef.current?.children[nextIndex] as HTMLElement;
      nextItem?.focus();
    } else if (event.key === 'Enter') {
      handleSelectEnvVar(filteredEnvVars[idx]);
    }
  };

  return (
    <Popover
      isLazy
      isOpen={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      returnFocusOnClose={false}
      placement="bottom-end"
    >
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
              {isCreateMode && <Text textStyle="heading/h4">Create variable</Text>}
              {isSelectMode && (
                <>
                  <Text textStyle="heading/h4">Insert variable</Text>
                  <Button variant="tertiary" size="sm" leftIconName="PlusOpen" onClick={switchToCreateMode}>
                    Create
                  </Button>
                </>
              )}
            </PopoverHeader>
            <PopoverBody>
              {isCreateMode && (
                <CreateEnvVar
                  envVars={environmentVariables}
                  onCreate={handleCreateEnvVar}
                  onCancel={handleCancelEnvVarCreate}
                />
              )}
              {isSelectMode && (
                <>
                  <FilterInput
                    ref={filterRef}
                    paddingBlock="8"
                    placeholder="Filter by key or source"
                    filter={filter}
                    onFilterChange={setFilter}
                  />
                  {isLoading && <LoadingState />}
                  {!isLoading && (
                    <List ref={listRef} maxH="18rem" overflowY="scroll">
                      {filteredEnvVars.length === 0 && (
                        <Text marginTop="16" marginBottom="8">
                          No env vars found
                        </Text>
                      )}
                      {filteredEnvVars.map((ev, idx) => (
                        <FocusableListItem
                          key={ev.key}
                          ev={ev}
                          index={idx}
                          onSelect={handleSelectEnvVar}
                          onKeyDown={handleKeyDown}
                        />
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

export default InsertEnvVarMenu;
