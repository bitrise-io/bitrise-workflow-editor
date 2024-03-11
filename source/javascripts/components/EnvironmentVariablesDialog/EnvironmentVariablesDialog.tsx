import { Button, ButtonGroup, Dialog, DialogBody, DialogFooter, DialogProps } from "@bitrise/bitkit";
import { FormProvider, useForm } from "react-hook-form";

import EnvironmentVariablesTable from "./components/EnvironmentVariablesTable";
import { EnvironmentVariable, HandlerFn, SelectEnvironmentVariableFormValues } from "./types";

type Props = Pick<DialogProps, "isOpen" | "onClose"> & {
	onSelect: HandlerFn;
	environmentVariables: EnvironmentVariable[];
};

const EnvironmentVariablesDialog = ({ environmentVariables, isOpen, onClose, onSelect }: Props) => {
	const form = useForm<SelectEnvironmentVariableFormValues>();

	const onSelectHandler = form.handleSubmit(({ key }) => {
		onSelect(environmentVariables.find((e) => e.key === key)!);
		onClose();
	});

	return (
		<FormProvider {...form}>
			<Dialog
				as="form"
				isOpen={isOpen}
				onClose={onClose}
				title="Insert variable"
				scrollBehavior="inside"
				onSubmit={onSelectHandler}
				onCloseComplete={form.reset}
			>
				<DialogBody py="4">
					<EnvironmentVariablesTable environmentVariables={environmentVariables} />
				</DialogBody>
				<DialogFooter>
					<ButtonGroup>
						<Button variant="secondary" onClick={onClose}>
							Cancel
						</Button>

						<Button type="submit" isDisabled={!form.formState.isValid}>
							Insert selected
						</Button>
					</ButtonGroup>
				</DialogFooter>
			</Dialog>
		</FormProvider>
	);
};

export default EnvironmentVariablesDialog;
