import { Divider, Table, Text, Thead, Tr, Th, Checkbox, Tbody, Button, Td } from "@bitrise/bitkit";
import { useState } from "react";

const WorkflowChooser = ({
	workflows,
	setSelectedWorkflow,
	onBack
}: {
	setSelectedWorkflow: (wf: string[] | null) => void,
	workflows: string[],
	onBack: () => void
}): JSX.Element => {
	const [selected, updateSelection] = useState<string[]>([]);
	const [all, setAll] = useState(false);
	const setOne = (wf: string, checked: boolean): void => {
		setAll(false);
		if (checked) {
			updateSelection([...selected, wf]);
		} else {
			updateSelection(prev => prev.filter(item => item !== wf));
		}
	};
	return (
		<>
			<Text size="2" textTransform="uppercase">
				Step 2 of 2
			</Text>
			<Text size="4" fontWeight="bold">
				Select Workflow(s)
			</Text>
			<Divider my="24" />
			<Text>Select the Workflows where you would like to apply the previously selected recipe.</Text>
			<Table>
				<Thead>
					<Tr>
						<Th>
							<Checkbox
								isChecked={all}
								onChange={ev => {
									setAll(ev.target.checked);
									updateSelection([]);
								}}
							/>
						</Th>
						<Th>Name</Th>
					</Tr>
				</Thead>
				<Tbody>
					{workflows.map(wf => (
						<Tr key={wf}>
							<Td>
								<Checkbox isChecked={all || selected.includes(wf)} onChange={ev => setOne(wf, ev.target.checked)} />
							</Td>
							<Td>{wf}</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
			<Text>By clicking "Apply," you consent to sharing the contents of your Bitrise.yml with OpenAI services.</Text>
			<Button variant="secondary" onClick={onBack}>
				Back
			</Button>
			<Button isDisabled={!all && selected.length === 0} onClick={() => setSelectedWorkflow(all ? null : selected)}>
				Apply
			</Button>
		</>
	);
};

export default WorkflowChooser;
