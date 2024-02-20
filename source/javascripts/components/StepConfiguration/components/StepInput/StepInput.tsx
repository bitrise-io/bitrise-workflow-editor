import { Box, ButtonGroup, IconButton, Provider } from "@bitrise/bitkit";
import { FormControl, Textarea } from "@chakra-ui/react";
import { ReactNode } from "react";

import useAutosize from "../../../../hooks/utils/useAutosize";
import StepInputLabel from "./StepInputLabel";

type Props = {
	name?: string;
	label?: ReactNode;
	isRequired?: boolean;
	isReadOnly?: boolean;
	isSensitive?: boolean;
	defaultValue?: string;
};

const StepInput = ({ name, label, isRequired, isReadOnly, isSensitive, defaultValue }: Props) => {
	const ref = useAutosize<HTMLTextAreaElement>();

	// TODO: display summary if provided, but display the first paragraph of description (markdown)
	return (
		<FormControl isRequired={isRequired} isReadOnly={isReadOnly || isSensitive}>
			<StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>
			<Box pos="relative">
				<Provider>
					<Textarea
						ref={ref}
						rows={1}
						name={name}
						resize="none"
						transition="height none"
						placeholder="Enter value"
						defaultValue={defaultValue}
					/>
				</Provider>
				<ButtonGroup position="absolute" top="8" right="8">
					{isSensitive && defaultValue && (
						<IconButton aria-label="Clear" iconName="CloseSmall" size="small" variant="tertiary" />
					)}
					{!isReadOnly && (
						<IconButton aria-label="Insert variable" iconName="Dollars" size="small" variant="secondary" />
					)}
				</ButtonGroup>
			</Box>
		</FormControl>
	);
};

export default StepInput;
