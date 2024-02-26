import { Box, ButtonGroup, IconButton, Provider } from "@bitrise/bitkit";
import { FormControl, FormHelperText, Select, Textarea } from "@chakra-ui/react";
import { ChangeEventHandler, FocusEvent } from "react";

import useAutosize from "../../../../hooks/utils/useAutosize";
import { Variable } from "../../../../models";
import StepInputLabel from "./StepInputLabel";

type Props = {
	input: Variable;
	onBlur: (e: FocusEvent, input: Variable) => void;
	onClickInsertSecret: (input: Variable) => void;
	onClickInsertVariable: (input: Variable) => void;
};

const StepInput = ({ input, onBlur, onClickInsertSecret, onClickInsertVariable }: Props) => {
	const ref = useAutosize<HTMLTextAreaElement>();

	const onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLSelectElement> = (e) => {
		input.value(e.target.value);
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
						<Select
							size="medium"
							onChange={onChange}
							backgroundSize="unset"
							isReadOnly={input.isSensitive()}
							isDisabled={input.isDontChangeValue()}
						>
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
							onChange={onChange}
							transition="height none"
							value={input.value() || ""}
							onBlur={(e) => onBlur(e, input)}
							isReadOnly={input.isSensitive()}
							isDisabled={input.isDontChangeValue()}
							placeholder={input.isSensitive() ? "Add secret" : "Enter value"}
						/>
					)}
				</Provider>

				{isButtonsVisible && (
					<ButtonGroup position="absolute" top="8" right="8">
						{isClearableInput && (
							<IconButton
								size="small"
								variant="tertiary"
								aria-label="Clear"
								iconName="CloseSmall"
								onClick={() => input.value("")}
							/>
						)}

						{input.isSensitive() && (
							<IconButton
								size="small"
								iconName="Dollars"
								variant="secondary"
								aria-label="Insert secret"
								onClick={() => onClickInsertSecret(input)}
							/>
						)}

						{!input.isSensitive() && (
							<IconButton
								size="small"
								iconName="Dollars"
								variant="secondary"
								aria-label="Insert variable"
								onClick={() => onClickInsertVariable(input)}
							/>
						)}
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
// export default memo(StepInput, (prevProps, nextProps) => {
// 	return prevProps.input.value() === nextProps.input.value();
// });
