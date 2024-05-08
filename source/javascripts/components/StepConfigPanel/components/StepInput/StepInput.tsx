import { ComponentProps, FocusEventHandler, MouseEventHandler, ReactNode, useState } from 'react';
import { Box, ButtonGroup, Dropdown, DropdownOption, DropdownProps, IconButton } from '@bitrise/bitkit';
import { FormControl, FormErrorMessage, forwardRef, Select, Textarea } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { useSecretsDialog } from '../../../SecretsDialog';
import InsertEnvVarMenu from '../../../InsertEnvVarMenu/InsertEnvVarMenu';
import { EnvironmentVariable } from '../../../InsertEnvVarMenu/types';
import { useEnvironmentVariables } from '../../../InsertEnvVarMenu/EnvironmentVariablesProvider';
import StepHelperText from '../StepHelperText';
import StepInputLabel from './StepInputLabel';

type CommonProps = {
  name: string;
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

type CursorPosition = {
  start: number;
  end: number;
};

function isSelectInput(props: Props): props is SelectProps {
  return !!(props as unknown as SelectProps).options;
}

function isTextareaInput(props: Props): props is TextareaProps {
  return !(props as unknown as SelectProps).options;
}

const StepInput = forwardRef<Props, 'textarea' | 'select'>((props: Props, ref) => {
  const { label, isRequired, isDisabled, isSensitive, helperSummary, helperDetails, ...rest } = props;

  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [cursorPosition, setCursorPosition] = useState<CursorPosition>();

  const { open: openSecretsDialog } = useSecretsDialog();
  const { isLoading, load: loadEnvVars, get: getEnvVars, create: createEnvVar } = useEnvironmentVariables();

  const name = rest.name || '';
  const value = watch(name, props.defaultValue);
  const isClearableInput = isSensitive && !!value;
  const errorText = errors?.[name]?.message?.toString();

  const handleClear: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setValue(name, '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleOnClickInsertSecret: MouseEventHandler<HTMLButtonElement> = (e) => {
    // NOTE: This is necessary because without it, the tooltip on the button reappears after the dialog is closed.
    e.currentTarget.blur();

    openSecretsDialog({
      onSelect: (secret) =>
        setValue(name, `$${secret.key}`, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }),
    });
  };

  const handleCreateEnvVarIntoInput = (ev: EnvironmentVariable) => {
    handleInsertEnvVarIntoInput(ev);
    createEnvVar(ev);
  };

  const handleInsertEnvVarIntoInput = (ev: EnvironmentVariable) => {
    const inputValue = value || '';
    const { key } = ev;
    const { start, end } = cursorPosition ?? {
      start: 0,
      end: inputValue.length,
    };

    setCursorPosition({ start, end: end + `$${key}`.length });
    setValue(name, `${inputValue.slice(0, start)}$${key.toUpperCase()}${inputValue.slice(end)}`, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
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

  const handleCreateEnvVarIntoDropdown = (envVar: EnvironmentVariable) => {
    handleInsertEnvVarIntoDropdown(envVar);
    createEnvVar(envVar);
  };

  const handleInsertEnvVarIntoDropdown = (envVar: EnvironmentVariable) => {
    setValue(name, `$${envVar.key}`, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleOnDropdownChange: DropdownProps<string | null>['onChange'] = (event) => {
    setValue(name, event.target.value || '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errorText}>
      <StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>

      <Box pos="relative">
        {isSelectInput(rest) && (
          <Box display="flex" flexDir="row" alignItems="center" gap="8">
            <Dropdown size="md" flex="1" ref={ref} search={false} value={value} onChange={handleOnDropdownChange}>
              {rest.options.map((optionValue) => (
                <DropdownOption key={optionValue} value={optionValue}>
                  {optionValue}
                </DropdownOption>
              ))}
              {value && rest.options.every((optionValue) => optionValue !== value) && (
                <DropdownOption value={value}>{value}</DropdownOption>
              )}
            </Dropdown>
            <InsertEnvVarMenu
              size="md"
              environmentVariables={getEnvVars()}
              isLoading={isLoading}
              onOpen={() => loadEnvVars()}
              onCreate={handleCreateEnvVarIntoDropdown}
              onSelect={handleInsertEnvVarIntoDropdown}
            />
          </Box>
        )}

        {isTextareaInput(rest) && (
          <>
            <Box
              display="grid"
              position="relative"
              data-replicated-value={value}
              _after={{
                padding: '11px',
                visibility: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                gridArea: '1 / 1 / 2 / 2',
                content: 'attr(data-replicated-value) " "',
              }}
            >
              <Textarea
                data-1p-ignore
                ref={ref}
                {...rest}
                fontFamily="mono"
                textStyle="body/md/regular"
                rows={1}
                resize="none"
                overflow="hidden"
                onBlur={handleOnBlur}
                transition="height none"
                gridArea="1 / 1 / 2 / 2"
                isDisabled={isSensitive || isDisabled}
                placeholder={isSensitive ? 'Add secret' : 'Enter value'}
              />
            </Box>

            {!isDisabled && (
              <ButtonGroup position="absolute" top="8" right="8">
                {isClearableInput && (
                  <IconButton
                    size="sm"
                    type="submit"
                    variant="tertiary"
                    aria-label="Clear"
                    onClick={handleClear}
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
                  <InsertEnvVarMenu
                    size="sm"
                    isLoading={isLoading}
                    onOpen={() => loadEnvVars()}
                    environmentVariables={getEnvVars()}
                    onCreate={handleCreateEnvVarIntoInput}
                    onSelect={handleInsertEnvVarIntoInput}
                  />
                )}
              </ButtonGroup>
            )}
          </>
        )}

        {errorText && <FormErrorMessage as="p">{errorText}</FormErrorMessage>}
        <StepHelperText summary={helperSummary} details={helperDetails} />
      </Box>
    </FormControl>
  );
});

export default StepInput;
