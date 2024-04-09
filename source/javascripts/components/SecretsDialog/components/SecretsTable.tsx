import { ChangeEventHandler, useCallback, useMemo, useState } from 'react';
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
  const [filter, setFilter] = useState('');
  const form = useFormContext<SelectSecretFormValues>();

  const { field } = useController({
    name: 'key',
    control: form.control,
    rules: { required: true },
  });

  const filteredSecrets = useMemo(() => {
    if (!filter) {
      return secrets;
    }

    return secrets.filter(({ key }) => key.toUpperCase().includes(filter));
  }, [secrets, filter]);

  const filterChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setFilter(e.target.value.toUpperCase());
  }, []);

  const debouncedFilterChangeHandler = useMemo(() => {
    return debounce(filterChangeHandler, 300);
  }, [filterChangeHandler]);

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
