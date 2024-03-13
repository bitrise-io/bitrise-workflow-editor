import {
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogFooter,
	Icon,
	Input,
	Select,
	Text,
	Toggletip,
} from "@bitrise/bitkit";

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

const AddTagTriggerDialog = (props: DialogProps) => {
	const { isOpen, onClose } = props;
	return (
		<Dialog title="Add tag trigger" maxWidth="480" isOpen={isOpen} onClose={onClose}>
			<DialogBody>
				<Text marginBottom="4" textStyle="heading/h3">
					Set up trigger
				</Text>
				<Text marginBottom="24" color="text/secondary">
					Define a tag and select a Pipeline or Workflow for execution on Bitrise whenever the tag is pushed to your
					repository.
				</Text>
				<Text marginBottom="16" textStyle="body/md/semibold">
					Tag
				</Text>
				<Checkbox marginBottom="8">Use regex pattern</Checkbox>
				<Toggletip label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text.">
					<Icon name="Info" size="16" marginLeft="5" />
				</Toggletip>
				<Input marginBottom="24"></Input>
				<Text color="text/primary" textStyle="body/md/semibold" marginBottom="4">
					Targeted Pipeline or Workflow
				</Text>
				<Select placeholder="Select a Pipeline or Workflow"></Select>
			</DialogBody>
			<DialogFooter display="flex" justifyContent="space-between">
				<Button variant="tertiary">Cancel</Button>
				<Button>Add trigger</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default AddTagTriggerDialog;
