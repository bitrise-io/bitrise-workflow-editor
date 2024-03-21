import { useId } from 'react';
import { Box, SelectableRow, Text } from '@bitrise/bitkit';

type Props = {
  value: string;
  source: string;
};

const EnvironmentVariablesTableRow = ({ value, source }: Props) => {
  const id = useId();
  const valueWithVariablePrefix = `$${value}`;

  return (
    <SelectableRow
      id={id}
      value={value}
      label={
        <Box>
          <Text>{valueWithVariablePrefix}</Text>
          <Text color="input/text/helper" size="2">
            {source}
          </Text>
        </Box>
      }
    />
  );
};

export default EnvironmentVariablesTableRow;
