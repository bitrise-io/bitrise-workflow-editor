import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Input, RadioGroup, Table, TableContainer, Th, Thead, Tr } from '@bitrise/bitkit';
import debounce from 'lodash/debounce';
import { useController, useFormContext } from 'react-hook-form';

import { EnvironmentVariable, SelectEnvironmentVariableFormValues } from '../types';
import EnvironmentVariablesTableRow from './EnvironmentVariablesTableRow';
import LoadingState from './LoadingState';

type Props = {
  environmentVariables: EnvironmentVariable[];
  isLoading?: boolean;
};

const EnvironmentVariablesTable = ({ environmentVariables, isLoading }: Props) => {
  const form = useFormContext<SelectEnvironmentVariableFormValues>();
  const [filteredVariables, setFilteredVariables] = useState(environmentVariables);

  const { field } = useController({
    name: 'key',
    control: form.control,
    rules: { required: true },
  });

  const filterChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setFilteredVariables(
        environmentVariables.filter(({ key }) => key.toUpperCase().includes(e.target.value.toUpperCase())),
      );
    },
    [environmentVariables],
  );

  const debouncedFilterChangeHandler = useMemo(() => {
    return debounce(filterChangeHandler, 300);
  }, [filterChangeHandler]);

  useEffect(() => {
    setFilteredVariables(environmentVariables);
  }, [environmentVariables]);

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
              {filteredVariables.map(({ key, source }) => (
                <EnvironmentVariablesTableRow key={key} value={key} source={source} />
              ))}
            </RadioGroup>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EnvironmentVariablesTable;
