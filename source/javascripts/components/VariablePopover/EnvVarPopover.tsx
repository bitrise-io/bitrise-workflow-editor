import { BitkitButton, BitkitIconButton, BitkitPopover, IconDollar, IconPlus } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { List, ListItem } from 'chakra-ui-2--react';
import { useCallback, useState } from 'react';

import { dispatchEnvVarCreated } from '@/components/SortableEnvVars/SortableEnvVars.events';
import useMultiModePopover, { Mode } from '@/components/VariablePopover/hooks/useMultiModePopover';
import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import PageProps from '@/core/utils/PageProps';
import useCodeSigningSecrets from '@/hooks/useCodeSigningSecrets';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';

import CreateEnvVar from './components/CreateEnvVar';
import FilterInput from './components/FilterInput';
import LoadingState from './components/LoadingState';

type Props = {
  size: 'sm' | 'md' | 'lg';
  isOpen?: boolean;
  mode?: Mode;
  onSelect: (item: EnvVar) => void;
  showCreate?: boolean;
  stepBundleId?: string;
  workflowId?: string;
};

const filterPredicate = (item: EnvVar, filter: string): boolean =>
  item.key.toUpperCase().includes(filter.toUpperCase()) || item.source.toUpperCase().includes(filter.toUpperCase());

const EnvVarPopover = ({
  size,
  onSelect,
  isOpen: initialIsOpen,
  mode: initialMode,
  showCreate = true,
  stepBundleId,
  workflowId,
}: Props) => {
  const appSlug = PageProps.appSlug();
  const [shouldLoadVars, setShouldLoadVars] = useState(Boolean(initialIsOpen));
  const { isLoading: isLoadingEnvVars, envs } = useEnvVars({
    stepBundleIds: stepBundleId ? [stepBundleId] : [],
    workflowIds: workflowId ? [workflowId] : [],
    enabled: shouldLoadVars,
  });
  const { isLoading: isLoadingSecrets, data: secrets = [] } = useSecrets({
    appSlug,
    options: { enabled: shouldLoadVars },
  });
  const { isLoading: isLoadingCodeSigning, data: codeSigningSecrets = [] } = useCodeSigningSecrets(shouldLoadVars);

  const isLoading = isLoadingEnvVars || isLoadingSecrets || isLoadingCodeSigning;
  const items = [...envs, ...secrets, ...codeSigningSecrets] as EnvVar[];
  items.sort((a, b) => a.key.localeCompare(b.key));

  const handleOnCreate = useCallback(
    (envVar: EnvVar) => {
      dispatchEnvVarCreated({
        envVar,
        source: workflowId ? EnvVarSource.Workflows : EnvVarSource.App,
        sourceId: workflowId,
      });
      EnvVarService.append(envVar, {
        source: workflowId ? EnvVarSource.Workflows : EnvVarSource.App,
        sourceId: workflowId,
      });
      onSelect(envVar);
    },
    [onSelect, workflowId],
  );

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
    onCreate: handleOnCreate,
    filterPredicate,
    onOpen: () => setShouldLoadVars(true),
    onClose: () => setShouldLoadVars(false),
  });

  return (
    <BitkitPopover
      open={isOpen}
      onOpenChange={(nextOpen) => (nextOpen ? open() : close())}
      positioning={{ placement: 'bottom-end' }}
      trigger={<BitkitIconButton size={size} icon={IconDollar} variant="secondary" label="Insert variable" />}
      title={isMode(Mode.CREATE) ? `Create ${workflowId ? 'workflow' : 'project'} variable` : 'Insert variable'}
      footer={
        isMode(Mode.SELECT) &&
        showCreate && (
          <BitkitButton variant="tertiary" size="sm" icon={IconPlus} onClick={() => switchTo(Mode.CREATE)}>
            Create
          </BitkitButton>
        )
      }
    >
      {isMode(Mode.CREATE) && <CreateEnvVar {...getCreateFormProps()} />}
      {isMode(Mode.SELECT) && (
        <>
          <FilterInput
            {...getFilterInputProps({
              label: 'Filter by key or source',
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
                <Text marginBlockStart="16" marginBlockEnd="8">
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
    </BitkitPopover>
  );
};

export default EnvVarPopover;
