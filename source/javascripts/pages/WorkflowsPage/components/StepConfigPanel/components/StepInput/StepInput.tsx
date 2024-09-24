import { ComponentProps, FocusEventHandler, MouseEventHandler, ReactNode, useState } from 'react';
import {
  Box,
  ButtonGroup,
  Dropdown,
  DropdownOption,
  DropdownProps,
  IconButton,
  Select,
  Textarea,
} from '@bitrise/bitkit';
import { forwardRef } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { EnvVar } from '@/core/models/EnvVar';
import { Secret } from '@/core/models/Secret';
import AutoGrowableInput from '@/components/AutoGrowableInput';
import SensitiveBadge from '@/components/unified-editor/StepConfigDrawer/components/SensitiveBadge';
import StepHelperText from '../StepHelperText';
import InsertEnvVarPopover from '../InsertEnvVarPopover/InsertEnvVarPopover';
import { useEnvironmentVariables } from '../InsertEnvVarPopover/EnvVarProvider';
import { useSecrets } from '../InsertSecretPopover/SecretsProvider';
import InsertSecretPopover from '../InsertSecretPopover/InsertSecretPopover';

type CommonProps = {
  name: string;
  label?: ReactNode;
  isSensitive?: boolean;
  helper?: { summary?: string; details?: string };
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

const StepInput = forwardRef<Props, 'textarea' | 'select'>(
  ({ isRequired, isDisabled, isSensitive, helper, helperText, ...props }: Props, ref) => {
    const {
      watch,
      setValue,
      formState: { errors },
    } = useFormContext();

    const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
    const name = props.name || '';
    const value = watch(name, props.defaultValue);
    const isClearableInput = isSensitive && !!value;
    const errorText = errors?.[name]?.message?.toString();

    const { isLoading: isLoadingSecrets, load: loadSecrets, create: createSecret, get: getSecrets } = useSecrets();
    const {
      isLoading: isLoadingEnvVars,
      load: loadEnvVars,
      get: getEnvVars,
      create: createEnvVar,
    } = useEnvironmentVariables();

    const handleClear: MouseEventHandler<HTMLButtonElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setValue(name, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    };

    const handleOnBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
      if (isTextareaInput(props)) {
        props.onBlur?.(e);
      }

      setCursorPosition({
        end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
        start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
      });
    };

    const handleCreateSecretIntoInput = (secret: Secret) => {
      handleInsertSecretIntoInput(secret);
      createSecret(secret);
    };

    const handleInsertSecretIntoInput = (secret: Secret) => {
      setValue(name, `$${secret.key}`, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    const handleCreateEnvVarIntoInput = (ev: EnvVar) => {
      handleInsertEnvVarIntoInput(ev);
      createEnvVar(ev);
    };

    const handleInsertEnvVarIntoInput = (ev: EnvVar) => {
      const inputValue = value || '';
      const { key } = ev;
      const { start, end } = cursorPosition ?? {
        start: 0,
        end: inputValue.length,
      };
      const newValue = `${inputValue.slice(0, start)}$${key}${inputValue.slice(end)}`;

      setCursorPosition({ start, end: end + `$${key}`.length });
      setValue(name, newValue, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    const handleCreateEnvVarIntoDropdown = (envVar: EnvVar) => {
      handleInsertEnvVarIntoDropdown(envVar);
      createEnvVar(envVar);
    };

    const handleInsertEnvVarIntoDropdown = (envVar: EnvVar) => {
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

    if (isSelectInput(props)) {
      return (
        <Box display="flex" gap="8">
          <Dropdown
            ref={ref}
            flex="1"
            size="md"
            value={value}
            search={false}
            isError={!!errorText}
            errorText={errorText}
            onChange={handleOnDropdownChange}
            readOnly={isSensitive || isDisabled}
            label={props.label}
            helperText={<StepHelperText summary={helper?.summary} details={helper?.details} />}
          >
            {props.options.map((optionValue) => (
              <DropdownOption key={optionValue} value={optionValue}>
                {optionValue}
              </DropdownOption>
            ))}
            {value && props.options.every((optionValue) => optionValue !== value) && (
              <DropdownOption value={value}>{value}</DropdownOption>
            )}
          </Dropdown>
          {/* TODO: The `pt="24"`isn't perfect when the dropdown label wraps to multiple lines. Check it later. */}
          <Box pt="24">
            <InsertEnvVarPopover
              size="md"
              onOpen={loadEnvVars}
              isLoading={isLoadingEnvVars}
              environmentVariables={getEnvVars()}
              onCreate={handleCreateEnvVarIntoDropdown}
              onSelect={handleInsertEnvVarIntoDropdown}
            />
          </Box>
        </Box>
      );
    }

    if (isTextareaInput(props)) {
      return (
        <AutoGrowableInput
          ref={ref}
          name={props.name}
          label={props.label}
          onBlur={handleOnBlur}
          onChange={props.onChange}
          fontFamily="monospace"
          isDisabled={isSensitive || isDisabled}
          badge={isSensitive ? <SensitiveBadge /> : undefined}
          placeholder={isSensitive ? 'Add secret' : 'Enter value'}
          formControlProps={{ isRequired }}
          errorText={errorText}
          helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
        >
          {!isDisabled && (
            <ButtonGroup position="absolute" top="6" right="6">
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
                <InsertSecretPopover
                  size="sm"
                  secrets={getSecrets()}
                  onOpen={loadSecrets}
                  isLoading={isLoadingSecrets}
                  onCreate={handleCreateSecretIntoInput}
                  onSelect={handleInsertSecretIntoInput}
                />
              )}

              {!isSensitive && (
                <InsertEnvVarPopover
                  size="sm"
                  onOpen={loadEnvVars}
                  isLoading={isLoadingEnvVars}
                  environmentVariables={getEnvVars()}
                  onCreate={handleCreateEnvVarIntoInput}
                  onSelect={handleInsertEnvVarIntoInput}
                />
              )}
            </ButtonGroup>
          )}
        </AutoGrowableInput>
      );
    }

    return null;
  },
);

export default StepInput;
