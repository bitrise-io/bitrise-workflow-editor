import { RadioGroup, Table, Th, Thead, Tr } from "@bitrise/bitkit";
import { useController, useFormContext } from "react-hook-form";

import { Secret, SelectSecretFormValues } from "../types";
import SecretsTableRow from "./SecretsTableRow";

type Props = {
	secrets: Secret[];
};

const SecretsTable = ({ secrets }: Props) => {
	const form = useFormContext<SelectSecretFormValues>();

	const { field } = useController({
		name: "key",
		control: form.control,
		rules: { required: true },
	});

	return (
		<Table>
			<Thead>
				<Tr>
					<Th />
					<Th>Key</Th>
					<Th>Source</Th>
				</Tr>
			</Thead>
			<RadioGroup as="tbody" {...field}>
				{secrets.map(({ key, source }) => (
					<SecretsTableRow key={key} value={key} source={source} />
				))}
			</RadioGroup>
		</Table>
	);
};

export default SecretsTable;
