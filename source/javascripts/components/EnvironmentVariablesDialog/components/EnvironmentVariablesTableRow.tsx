import { SelectableRow, Td } from "@bitrise/bitkit";
import { useId } from "react";

type Props = {
	value: string;
	source: string;
};

const EnvironmentVariablesTableRow = ({ value, source }: Props) => {
	const id = useId();
	const valueWithVariablePrefix = `$${value}`;

	return (
		<SelectableRow id={id} label={valueWithVariablePrefix} value={value}>
			<Td>{source}</Td>
		</SelectableRow>
	);
};

export default EnvironmentVariablesTableRow;
