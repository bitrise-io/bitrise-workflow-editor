import {
  Box,
  Button,
  Dropdown,
  DropdownGroup,
  DropdownOption,
  DropdownProps,
  DropdownSearch,
  EmptyState,
} from '@bitrise/bitkit';
import { useMemo, useRef, useState } from 'react';

export interface EntitySelectorProps extends Omit<DropdownProps<string>, 'onChange'> {
  entityIds: string[];
  entityName?: string;
  onChange: (selectedValue: string | undefined) => void;
  onCreate?: () => void;
  secondaryEntities?: {
    label: string;
    ids: string[];
  };
}

const EntitySelector = (props: EntitySelectorProps) => {
  const { entityIds, entityName, onChange, onCreate, secondaryEntities, value } = props;

  const dropdownRef = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');

  const filteredIds = useMemo(() => {
    return entityIds.filter((id) => id.toLowerCase().includes(search.toLowerCase()));
  }, [entityIds, search]);

  const filteredSecondaryIds = useMemo(() => {
    const secondaryIds = secondaryEntities?.ids || [];

    return secondaryIds.filter((id) => id.toLowerCase().includes(search.toLowerCase()));
  }, [secondaryEntities, search]);

  const hasNoSearchResults = search && filteredIds.length === 0 && filteredSecondaryIds.length === 0;

  const handleCreate = () => {
    onCreate?.();
    dropdownRef.current?.click(); // NOTE: It closes the dropdown...
  };

  return (
    <Dropdown
      flex="1"
      size="md"
      ref={dropdownRef}
      dropdownMaxHeight="359px"
      minWidth="0"
      value={value}
      onChange={({ target: { value: selectedValue } }) => onChange(selectedValue || undefined)}
      search={<DropdownSearch placeholder="Filter by name..." value={search} onChange={setSearch} />}
    >
      {filteredIds.map((id) => (
        <DropdownOption key={id} value={id}>
          {id}
        </DropdownOption>
      ))}
      {!!secondaryEntities && filteredSecondaryIds.length > 0 && (
        <DropdownGroup label={secondaryEntities.label} labelProps={{ whiteSpace: 'nowrap' }}>
          {filteredSecondaryIds.map((id) => (
            <DropdownOption key={id} value={id}>
              {id}
            </DropdownOption>
          ))}
        </DropdownGroup>
      )}
      {hasNoSearchResults && (
        <EmptyState
          iconName="Magnifier"
          backgroundColor="background/primary"
          title={`No ${entityName}s are matching your filter`}
          description="Modify your search to get results"
        />
      )}
      {!!onCreate && (
        <Box
          paddingY="8"
          position="sticky"
          bottom="-8px"
          marginBottom="-8px"
          borderTop="1px solid"
          borderColor="border/regular"
          backgroundColor="background/primary"
        >
          <Button
            borderRadius="0"
            color="button.secondary"
            fontWeight="400"
            justifyContent="flex-start"
            leftIconName="Plus"
            variant="tertiary"
            width="100%"
            onClick={handleCreate}
          >
            Create {entityName}
          </Button>
        </Box>
      )}
    </Dropdown>
  );
};

export default EntitySelector;
