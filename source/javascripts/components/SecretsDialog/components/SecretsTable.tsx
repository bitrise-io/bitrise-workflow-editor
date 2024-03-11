import { Input, RadioGroup, Table, Th, Thead, Tr } from "@bitrise/bitkit";
import debounce from "lodash/debounce";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Secret, SelectSecretFormValues } from "../types";
import SecretsTableRow from "./SecretsTableRow";

type Props = {
	secrets: Secret[];
};

const SecretsTable = ({ secrets }: Props) => {
	const form = useFormContext<SelectSecretFormValues>();
	const [filteredSecrets, setFilteredSecrets] = useState(secrets);

	const { field } = useController({
		name: "key",
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

	return (
		<>
			<Input
				autoFocus
				leftIconName="Magnifier"
				placeholder="Filter by key..."
				{...form.register("filter", { onChange: debouncedFilterChangeHandler })}
			/>
			<Table>
				<Thead>
					<Tr>
						<Th />
						<Th>Key</Th>
						<Th>Source</Th>
					</Tr>
				</Thead>
				<RadioGroup as="tbody" {...field}>
					{filteredSecrets.map(({ key, source }) => (
						<SecretsTableRow key={key} value={key} source={source} />
					))}
				</RadioGroup>
			</Table>
		</>
	);
};

export default SecretsTable;
