import {
	Button,
	ButtonGroup,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogProps,
	SegmentedControl,
	SegmentedControlItem,
} from "@bitrise/bitkit";
import { FormProvider, useController, useForm } from "react-hook-form";

import CreateSecret from "./components/CreateSecret";
import SecretsTable from "./components/SecretsTable";
import { CreateSecretFormValues, Secret, SelectSecretFormValues } from "./types";

type Props = Pick<DialogProps, "isOpen" | "onClose"> & {
	source: string;
	secrets: Secret[];
	onSelect: (secret: Secret) => void;
	onCreate: (secret: Secret) => void;
};

enum Segment {
	SELECT = "select",
	CREATE = "create",
}

const SecretsDialog = ({ source, secrets, isOpen, onClose, onSelect, onCreate }: Props) => {
	const selectSecretForm = useForm<SelectSecretFormValues>();
	const createSecretForm = useForm<CreateSecretFormValues>({ mode: "all" });

	const segmentForm = useForm({ defaultValues: { segment: Segment.SELECT } });
	const { field: segmentField } = useController({ name: "segment", control: segmentForm.control });

	const isSelectSegment = segmentField.value === Segment.SELECT;
	const isCreateSegment = segmentField.value === Segment.CREATE;

	const onSelectHandler = selectSecretForm.handleSubmit(({ key }) => {
		onSelect(secrets.find((s) => s.key === key)!);
		onClose();
	});

	const onCreateHandler = createSecretForm.handleSubmit(({ key, ...secret }) => {
		onCreate({ key: `$${key}`, ...secret });
		onSelect({ key: `$${key}`, ...secret });
		onClose();
	});

	const resetForms = () => {
		segmentForm.reset();
		selectSecretForm.reset();
		createSecretForm.reset();
	};

	return (
		<Dialog
			as="form"
			isOpen={isOpen}
			onClose={onClose}
			scrollBehavior="inside"
			onCloseComplete={resetForms}
			title="Insert secret environment variable"
			onSubmit={isSelectSegment ? onSelectHandler : onCreateHandler}
		>
			<DialogBody display="flex" flexDirection="column" gap="24">
				<SegmentedControl {...segmentField}>
					<SegmentedControlItem value="select">Select existing</SegmentedControlItem>
					<SegmentedControlItem value="create">Create</SegmentedControlItem>
				</SegmentedControl>

				{isSelectSegment && (
					<FormProvider {...selectSecretForm}>
						<SecretsTable secrets={secrets} />
					</FormProvider>
				)}

				{isCreateSegment && (
					<FormProvider {...createSecretForm}>
						<CreateSecret source={source} />
					</FormProvider>
				)}
			</DialogBody>
			<DialogFooter>
				<ButtonGroup>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>

					{isSelectSegment && (
						<Button type="submit" isDisabled={!selectSecretForm.formState.isValid}>
							Insert selected
						</Button>
					)}

					{isCreateSegment && (
						<Button type="submit" isDisabled={!createSecretForm.formState.isValid}>
							Create and insert
						</Button>
					)}
				</ButtonGroup>
			</DialogFooter>
		</Dialog>
	);
};

export default SecretsDialog;
