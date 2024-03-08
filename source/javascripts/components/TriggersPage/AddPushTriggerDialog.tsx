import {
	Box,
	Button,
	Card,
	Checkbox,
	Dialog,
	DialogBody,
	DialogFooter,
	Divider,
	Input,
	ProgressIndicator,
	Select,
	Text,
	Tooltip,
} from "@bitrise/bitkit";

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

const AddPushTriggerDialog = (props: DialogProps) => {
	const { isOpen, onClose } = props;
	const dialogStages = [{ label: "Conditions" }, { label: "Target" }];

	return (
		<Dialog isOpen={isOpen} onClose={onClose} title="Add push trigger" maxWidth="480">
			<DialogBody>
				<Box marginBottom="24">
					<ProgressIndicator variant="horizontal" stages={dialogStages} activeStageIndex={0} />
				</Box>
				<Divider marginBottom="24" />
				<Text color="text/primary" textStyle="heading/h3" marginBottom="4">
					Set up trigger conditions
				</Text>
				<Text color="text/secondary" marginBottom="24">
					Configure the{" "}
					<Tooltip label="Configure the conditions that should all be met to execute the targeted Pipeline or Workflow.">
						conditions
					</Tooltip>{" "}
					that should all be met to execute the targeted Pipeline or Workflow.
				</Text>
				<Card marginBottom="16" padding="16px 16px 24px 16px">
					<Text textStyle="heading/h5" marginBottom="16">
						Condition 1
					</Text>
					<Select marginBottom="16">
						<option value="push_branch">Push branch</option>
						<option value="commit_message">Commit message</option>
						<option value="file_change">File change</option>
					</Select>
					<Checkbox marginBottom="8">Use regex pattern</Checkbox>
					<Input></Input>
				</Card>
				<Button variant="secondary" leftIconName="PlusAdd" width="100%">
					Add condition
				</Button>
			</DialogBody>
			<DialogFooter display="flex" justifyContent="space-between">
				<Button variant="tertiary">Cancel</Button>
				<Button rightIconName="ArrowRight">Next</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default AddPushTriggerDialog;
