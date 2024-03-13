import { Box, ButtonGroup, IconButton } from "@bitrise/bitkit";
import { FormControl, forwardRef, Select, Textarea } from "@chakra-ui/react";
import omit from "lodash/omit";
import { ComponentProps, FocusEventHandler, MouseEventHandler, ReactNode, useState } from "react";
import { useFormContext } from "react-hook-form";

import useAutosize from '../../../../hooks/utils/useAutosize';
import { useEnvironmentVariablesDialog } from "../../../EnvironmentVariablesDialog/EnvironmentVariablesDialog";
import { useSecretsDialog } from '../../../SecretsDialog';
import StepInputHelper from './StepInputHelper';
import StepInputLabel from './StepInputLabel';

type CommonProps = {
  label?: ReactNode;
  isSensitive?: boolean;
  helperSummary?: string;
  helperDetails?: string;
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

const StepInput = forwardRef<Props, 'textarea' | 'select'>((props: Props, ref) => {
  const { label, isRequired, isSensitive, helperSummary, helperDetails, ...rest } = props;

	const { watch, setValue, getValues } = useFormContext();
  const { open: openSecretsDialog } = useSecretsDialog();
	const { open: openEnvironmentVariablesDialog } = useEnvironmentVariablesDialog();
	const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>();
  const textareaRef = useAutosize<HTMLTextAreaElement>(ref);

  const onClear = () => setValue(rest.name || '', '');
  const isClearableInput = isSensitive && !!watch(rest.name || '', props.defaultValue);

  const handleOnClickInsertSecret: MouseEventHandler<HTMLButtonElement> = (e) => {
    // NOTE: This is necessary because without it, the tooltip on the button reappears after the dialog is closed.
    e.currentTarget.blur();

    openSecretsDialog({
      onSelect: (secret) => setValue(rest.name || '', `$${secret.key}`),
    });
  };

	const handleOnClickInsertEnvironmentVariable: MouseEventHandler<HTMLButtonElement> = (e) => {
		// NOTE: This is necessary because without it, the tooltip on the button reappears after the dialog is closed.
		e.currentTarget.blur();

		openEnvironmentVariablesDialog({
			onSelect: ({ key }) => {
				const value = (getValues(props.name!) || "") as string;
				const { start, end } = cursorPosition ?? { start: value.length, end: value.length };

				setCursorPosition({ start, end: end + `$${key}`.length });
				setValue(props.name || "", `${value.slice(0, start)}$${key}${value.slice(end)}`);
			},
		});
	};

	const handleOnBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
		if (isTextareaInput(rest) && rest.onBlur) {
			rest.onBlur(e);
		}

		setCursorPosition({
			end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
			start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
		});
	};

  return (
    <FormControl isRequired={isRequired}>
      <StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>

      <Box pos="relative">
        {isSelectInput(rest) && (
          <Select ref={ref} {...omit(rest, 'options')} size="medium" backgroundSize="unset">
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
							onBlur={handleOnBlur}
              transition="height none"
              isReadOnly={isSensitive || rest.isReadOnly}
              placeholder={isSensitive ? 'Add secret' : 'Enter value'}
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
                  <IconButton
                    size="sm"
                    iconName="Dollars"
                    variant="secondary"
                    aria-label="Insert secret"
                    onClick={handleOnClickInsertSecret}
                  />
                )}

                {!isSensitive && (
									<IconButton
										size="sm"
										iconName="Dollars"
										variant="secondary"
										aria-label="Insert variable"
										onClick={handleOnClickInsertEnvironmentVariable}
									/>
                )}
              </ButtonGroup>
            )}
          </>
        )}

        <StepInputHelper summary={helperSummary} details={helperDetails} />
      </Box>
    </FormControl>
  );
});

export default StepInput;
