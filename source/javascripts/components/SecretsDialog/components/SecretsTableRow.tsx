import { useId } from 'react';
import { SelectableRow, Td } from '@bitrise/bitkit';

type Props = {
  value: string;
  source: string;
};

const SecretsTableRow = ({ value, source }: Props) => {
  const id = useId();
  const valueWithVariablePrefix = `$${value}`;

  return (
    <SelectableRow id={id} label={valueWithVariablePrefix} value={value}>
      <Td>{source}</Td>
    </SelectableRow>
  );
};

export default SecretsTableRow;
