import { Box, ButtonGroup, IconButton, Provider } from "@bitrise/bitkit";
import { FormControl, FormHelperText, Select, Textarea } from "@chakra-ui/react";
import { ChangeEventHandler } from "react";

import useAutosize from "../../../../hooks/utils/useAutosize";
import { Variable } from "../../../../models";
import StepInputLabel from "./StepInputLabel";

type Props = {
	input: Variable;
	onClickInsertVariable: (input: Variable) => void;
};

const StepInput = ({ input, onClickInsertVariable }: Props) => {
	const ref = useAutosize<HTMLTextAreaElement>();

	const onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLSelectElement> = (e) => {
		input.value(e.target.value);
	};

	const inputProps = {
		onChange,
		isReadOnly: input.isSensitive(),
		isDisabled: input.isDontChangeValue(),
		defaultValue: input.value() || input.valueOptions()?.[0] || "",
	};

	const isSelectInput = !!input.valueOptions();
	const isButtonsVisible = !input.isDontChangeValue();
	const isClearableInput = input.isSensitive() && !!input.value();

	return (
		<FormControl isRequired={input.isRequired()}>
			<StepInputLabel isSensitive={input.isSensitive()}>{input.title()}</StepInputLabel>

			<Box pos="relative">
				<Provider>
					{isSelectInput && (
						<Select size="medium" backgroundSize="unset" {...inputProps}>
							{input.valueOptions()?.map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</Select>
					)}

					{!isSelectInput && (
						<Textarea
							ref={ref}
							rows={1}
							resize="none"
							transition="height none"
							placeholder={input.isSensitive() ? "Add secret" : "Enter value"}
							{...inputProps}
						/>
					)}
				</Provider>

				{isButtonsVisible && (
					<ButtonGroup position="absolute" top="8" right="8">
						{isClearableInput && (
							<IconButton aria-label="Clear" iconName="CloseSmall" size="small" variant="tertiary" />
						)}
						<IconButton
							size="small"
							iconName="Dollars"
							variant="secondary"
							onClick={() => onClickInsertVariable(input)}
							aria-label={input.isSensitive() ? "Insert secret" : "Insert variable"}
						/>
					</ButtonGroup>
				)}
			</Box>
			<FormHelperText as="p">
				{JSON.stringify({
					isRequired: input.isRequired(),
					isSensitive: input.isSensitive(),
					isDontChangeValue: input.isDontChangeValue(),
				})}
			</FormHelperText>
		</FormControl>
	);
};

export default StepInput;
