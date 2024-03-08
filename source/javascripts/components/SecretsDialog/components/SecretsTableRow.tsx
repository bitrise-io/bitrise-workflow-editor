import { SelectableRow, Td } from "@bitrise/bitkit";
import { useId } from "react";

type Props = {
	value: string;
	source: string;
};

const SecretsTableRow = ({ value, source }: Props) => {
	const id = useId();

	return (
		<SelectableRow id={id} label={value} value={value}>
			<Td>{source}</Td>
		</SelectableRow>
	);
};

export default SecretsTableRow;
