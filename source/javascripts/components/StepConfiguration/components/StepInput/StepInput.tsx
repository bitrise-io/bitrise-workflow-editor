import { Box, ButtonGroup, IconButton } from "@bitrise/bitkit";
import { FormControl, FormHelperText, forwardRef, Select, Textarea } from "@chakra-ui/react";
import omit from "lodash/omit";
import { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import useAutosize from "../../../../hooks/utils/useAutosize";
import StepInputLabel from "./StepInputLabel";

type CommonProps = {
	label?: ReactNode;
	isSensitive?: boolean;
};

type SelectProps = ComponentProps<typeof Select> &
	CommonProps & {
		options: string[];
	};

type TextareaProps = ComponentProps<typeof Textarea> & CommonProps;

type Props = SelectProps | TextareaProps;

function isSelectInput(props: Props): props is SelectProps {
	return !!(props as unknown as SelectProps).options;
}

function isTextareaInput(props: Props): props is TextareaProps {
	return !(props as unknown as SelectProps).options;
}

const StepInput = forwardRef<Props, "textarea" | "select">((props: Props, ref) => {
	const { label, isRequired, isSensitive, ...rest } = props;

	const { watch, setValue } = useFormContext();
	const textareaRef = useAutosize<HTMLTextAreaElement>(ref);

	const onClear = () => setValue(rest.name!, "");
	const isClearableInput = isSensitive && !!watch(rest.name || "", props.defaultValue);

	return (
		<FormControl isRequired={isRequired}>
			<StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>

			<Box pos="relative">
				{isSelectInput(rest) && (
					<Select ref={ref} {...omit(rest, "options")} size="medium" backgroundSize="unset">
						{rest.options.map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</Select>
				)}

				{isTextareaInput(rest) && (
					<>
						<Textarea
							ref={textareaRef}
							{...rest}
							rows={1}
							resize="none"
							transition="height none"
							isReadOnly={isSensitive || rest.isReadOnly}
							placeholder={isSensitive ? "Add secret" : "Enter value"}
						/>

						{!rest.isReadOnly && (
							<ButtonGroup position="absolute" top="8" right="8">
								{isClearableInput && (
									<IconButton
										size="sm"
										type="submit"
										onClick={onClear}
										variant="tertiary"
										aria-label="Clear"
										iconName="CloseSmall"
									/>
								)}

								{isSensitive && (
									<IconButton size="sm" iconName="Dollars" variant="secondary" aria-label="Insert secret" />
								)}

								{!isSensitive && (
									<IconButton size="sm" iconName="Dollars" variant="secondary" aria-label="Insert variable" />
								)}
							</ButtonGroup>
						)}
					</>
				)}
			</Box>
			<FormHelperText as="p">
				{JSON.stringify({
					isRequired,
					isSensitive,
					isReadOnly: rest.isReadOnly,
				})}
			</FormHelperText>
		</FormControl>
	);
});

export default StepInput;
