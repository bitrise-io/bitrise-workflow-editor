import { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { Box, ButtonGroup, IconButton } from "@bitrise/bitkit";
import { FormControl, forwardRef, Select, Textarea } from "@chakra-ui/react";
import omit from "lodash/omit";
import { useFormContext } from "react-hook-form";

import useAutosize from "../../../../hooks/utils/useAutosize";
import { useSecretsDialog } from "../../../SecretsDialog/SecretsDialogProvider";
import StepInputHelper from "./StepInputHelper";
import StepInputLabel from "./StepInputLabel";

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

const StepInput = forwardRef<Props, "textarea" | "select">(
  (props: Props, ref) => {
    const {
      label,
      isRequired,
      isSensitive,
      helperSummary,
      helperDetails,
      name = "",
      ...rest
    } = props;

    const { watch, setValue } = useFormContext();
    const { open: openSecretsDialog } = useSecretsDialog();
    useAutosize<HTMLTextAreaElement>(ref);

    const onClear = () => setValue(name, "");
    const isClearableInput = isSensitive && !!watch(name, props.defaultValue);

    const handleOnClickInsertSecret: MouseEventHandler<HTMLButtonElement> = (
      e,
    ) => {
      // NOTE: This is necessary because without it, the tooltip on the button reappears after the dialog is closed.
      e.currentTarget.blur();

      openSecretsDialog({
        onSelect: (secret) => setValue(name, `$${secret.key}`),
      });
    };

    return (
      <FormControl isRequired={isRequired}>
        <StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>

        <Box pos="relative">
          {isSelectInput(rest) && (
            <Select
              ref={ref}
              name={name}
              {...omit(rest, "options")}
              size="medium"
              backgroundSize="unset"
            >
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
                ref={ref}
                name={name}
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
  },
);

export default StepInput;
