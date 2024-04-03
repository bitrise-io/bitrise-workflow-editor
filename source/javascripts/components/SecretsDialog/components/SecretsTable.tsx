import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Input, RadioGroup, Table, TableContainer, Th, Thead, Tr } from '@bitrise/bitkit';
import debounce from 'lodash/debounce';
import { useController, useFormContext } from 'react-hook-form';

import { Secret, SelectSecretFormValues } from '../types';
import SecretsTableRow from './SecretsTableRow';
import LoadingState from './LoadingState';

type Props = {
  secrets: Secret[];
  isLoading?: boolean;
};

const SecretsTable = ({ secrets, isLoading }: Props) => {
  const form = useFormContext<SelectSecretFormValues>();
  const [filteredSecrets, setFilteredSecrets] = useState(secrets);

  const { field } = useController({
    name: 'key',
    control: form.control,
    rules: { required: true },
  });

  const filterChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setFilteredSecrets(secrets.filter((secret) => secret.key.toUpperCase().includes(e.target.value.toUpperCase())));
    },
    [secrets],
  );

  const debouncedFilterChangeHandler = useMemo(() => {
    return debounce(filterChangeHandler, 300);
  }, [filterChangeHandler]);

  useEffect(() => {
    setFilteredSecrets(secrets);
  }, [secrets]);

  return (
    <Box display="flex" flexDirection="column" gap="16">
      <Input
        autoFocus
        leftIconName="Magnifier"
        placeholder="Filter by key..."
        {...form.register('filter', { onChange: debouncedFilterChangeHandler })}
      />
      <TableContainer>
        <Table disableRowHover={isLoading} isFixed>
          <Thead>
            <Tr>
              <Th width="40px" />
              <Th>Key</Th>
            </Tr>
          </Thead>
          {isLoading && <LoadingState />}
          {!isLoading && (
            <RadioGroup as="tbody" {...field}>
              {filteredSecrets.map(({ key, source }) => (
                <SecretsTableRow key={key} value={key} source={source} />
              ))}
            </RadioGroup>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SecretsTable;
