import {
	Box,
	Button,
	Card,
	Checkbox,
	Dialog,
	DialogBody,
	DialogFooter,
	Divider,
	Icon,
	Input,
	ProgressIndicator,
	Select,
	Text,
	Toggletip,
	Tooltip,
} from "@bitrise/bitkit";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

type Inputs = {
	checkbox: boolean;
	type: "push_branch" | "commit_message" | "file_change";
	value: string;
};

const PLACEHOLDER_MAP: Record<Inputs["type"], string> = {
	push_branch: "Enter a push branch",
	commit_message: "Enter a commit message",
	file_change: "Enter a path",
};

const AddPushTriggerDialog = (props: DialogProps) => {
	const { isOpen, onClose } = props;
	const dialogStages = [{ label: "Conditions" }, { label: "Target" }];

	const { register, reset, handleSubmit, watch } = useForm<Inputs>({
		defaultValues: {
			type: "push_branch",
		},
	});

	const onSubmit = (data: any) => {
		console.log(data);
	};

	const { checkbox, type } = watch();

	const getPlaceholderText = (): string => {
		if (checkbox) {
			return "Enter a regex pattern";
		}
		return PLACEHOLDER_MAP[type];
	};

	const createNewCard = (conditionNumber: number) => {
		return (
			<Card key={conditionNumber} marginBottom="16" padding="16px 16px 24px 16px">
				<Text textStyle="heading/h5" marginBottom="16">
					Condition {conditionNumber}
				</Text>
				<Select marginBottom="16" {...register("type")}>
					<option value="push_branch">Push branch</option>
					<option value="commit_message">Commit message</option>
					<option value="file_change">File change</option>
				</Select>
				<Checkbox marginBottom="8" {...register("checkbox")}>
					Use regex pattern
				</Checkbox>
				<Toggletip label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text.">
					<Icon name="Info" size="16" marginLeft="5" />
				</Toggletip>
				<Input placeholder={getPlaceholderText()} {...register("value")}></Input>
			</Card>
		);
	};

	const [conditions, setConditions] = useState<ReactNode[]>([createNewCard(1)]);

	const handleAddCondition = () => {
		setConditions((prevCards) => [...prevCards, createNewCard(prevCards.length + 1)]);
	};

	const onFormCancel = () => {
		onClose();
		reset();
	};

	return (
		<Dialog
			as="form"
			action="/foo/bar"
			isOpen={isOpen}
			onClose={onFormCancel}
			title="Add push trigger"
			maxWidth="480"
			onSubmit={handleSubmit(onSubmit)}
		>
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
				{conditions}
				<Button variant="secondary" leftIconName="PlusAdd" width="100%" onClick={handleAddCondition}>
					Add condition
				</Button>
			</DialogBody>
			<DialogFooter display="flex" justifyContent="space-between">
				<Button onClick={onFormCancel} variant="tertiary">
					Cancel
				</Button>
				<Button rightIconName="ArrowRight" type="submit">
					Next
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default AddPushTriggerDialog;
