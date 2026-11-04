import { BitkitButton, BitkitIconButton, BitkitPopover, IconDollar, IconPlus } from '@bitrise/bitkit-v2';
import { PopoverPropsProvider } from '@chakra-ui/react/popover';
import { Text } from '@chakra-ui/react/text';
import { List, ListItem } from 'chakra-ui-2--react';
import { useState } from 'react';

import useMultiModePopover, { Mode } from '@/components/VariablePopover/hooks/useMultiModePopover';
import { Secret } from '@/core/models/Secret';
import PageProps from '@/core/utils/PageProps';
import useCodeSigningSecrets from '@/hooks/useCodeSigningSecrets';
import { useSecrets, useUpsertSecret } from '@/hooks/useSecrets';

import CreateSecret from './components/CreateSecret';
import FilterInput from './components/FilterInput';
import LoadingState from './components/LoadingState';

// BitkitPopover mounts its hidden panel in <body> up front. Inside a BitkitDialog the dialog then
// marks that panel aria-hidden as it opens, and each StepInput would keep its own copy mounted.
// Mounting on open avoids both; drop this once BitkitPopover mounts lazily itself.
const LAZY_POPOVER = { lazyMount: true, unmountOnExit: true };

type Props = {
  size: 'sm' | 'md' | 'lg';
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
  const { isLoading: isLoadingSecrets, data: secrets = [] } = useSecrets({
    appSlug,
    options: { enabled: shouldLoadVars },
  });
  const { isLoading: isLoadingCodeSigning, data: codeSigningSecrets = [] } = useCodeSigningSecrets(shouldLoadVars);
  const isLoading = isLoadingSecrets || isLoadingCodeSigning;
  const items = [...secrets, ...codeSigningSecrets];

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
    items,
    mode: initialMode,
    isOpen: initialIsOpen,
    onCreate: createSecret,
    onSelect,
    filterPredicate,
    onOpen: () => setShouldLoadVars(true),
    onClose: () => setShouldLoadVars(false),
  });

  return (
    <PopoverPropsProvider value={LAZY_POPOVER}>
      <BitkitPopover
        open={isOpen}
        onOpenChange={(nextOpen) => (nextOpen ? open() : close())}
        positioning={{ placement: 'bottom-end' }}
        trigger={<BitkitIconButton size={size} icon={IconDollar} variant="secondary" label="Insert secret" />}
        title={isMode(Mode.CREATE) ? 'Create secret' : 'Insert secret'}
        footer={
          isMode(Mode.SELECT) && (
            <BitkitButton variant="tertiary" size="sm" icon={IconPlus} onClick={() => switchTo(Mode.CREATE)}>
              Create
            </BitkitButton>
          )
        }
      >
        {isMode(Mode.CREATE) && <CreateSecret {...getCreateFormProps()} />}
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
      </BitkitPopover>
    </PopoverPropsProvider>
  );
};

export default SecretPopover;
