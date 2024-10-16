import { ComponentProps, FocusEventHandler, MouseEventHandler, ReactNode, useEffect, useRef, useState } from 'react';
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
import { FormControl, FormErrorMessage, forwardRef, useMergeRefs } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { EnvVar } from '@/core/models/EnvVar';
import { Secret } from '@/core/models/Secret';
import StepHelperText from '../StepHelperText';
import InsertEnvVarPopover from '../InsertEnvVarPopover/InsertEnvVarPopover';
import { useEnvironmentVariables } from '../InsertEnvVarPopover/EnvVarProvider';
import { useSecrets } from '../InsertSecretPopover/SecretsProvider';
import InsertSecretPopover from '../InsertSecretPopover/InsertSecretPopover';
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const mergedTextAreaRef = useMergeRefs(ref, textAreaRef);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.querySelector('textarea')?.setAttribute('style', 'height: 100%');
    }
  }, []);

  const { label, isRequired, isDisabled, isSensitive, helperSummary, helperDetails, ...rest } = props;

  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
  const name = rest.name || '';
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
    if (isTextareaInput(rest) && rest.onBlur) {
      rest.onBlur(e);
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

    setCursorPosition({ start, end: end + `$${key}`.length });
    setValue(name, `${inputValue.slice(0, start)}$${key}${inputValue.slice(end)}`, {
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

  if (isSelectInput(rest)) {
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
          label={label}
          helperText={<StepHelperText summary={helperSummary} details={helperDetails} />}
        >
          {rest.options.map((optionValue) => (
            <DropdownOption key={optionValue} value={optionValue}>
              {optionValue}
            </DropdownOption>
          ))}
          {value && rest.options.every((optionValue) => optionValue !== value) && (
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

  if (isTextareaInput(rest)) {
    return (
      <FormControl isRequired={isRequired} isInvalid={!!errorText}>
        <StepInputLabel isSensitive={isSensitive}>{label}</StepInputLabel>

        <Box pos="relative">
          <Box
            display="grid"
            fontFamily="mono"
            position="relative"
            textStyle="body/md/regular"
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
              ref={mergedTextAreaRef}
              {...rest}
              rows={1}
              resize="none"
              overflow="hidden"
              onBlur={handleOnBlur}
              transition="height none"
              gridArea="1 / 1 / 2 / 2"
              isDisabled={isSensitive || isDisabled}
              placeholder={isSensitive ? 'Add secret' : 'Enter value'}
              data-1p-ignore
            />
          </Box>

          {!isDisabled && (
            <ButtonGroup position="absolute" top="6" right="6">
              {isClearableInput && (
                <IconButton
                  size="sm"
                  type="submit"
                  variant="tertiary"
                  aria-label="Clear"
                  onClick={handleClear}
                  iconName="Cross"
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

          {errorText && <FormErrorMessage as="p">{errorText}</FormErrorMessage>}
          <StepHelperText summary={helperSummary} details={helperDetails} />
        </Box>
      </FormControl>
    );
  }

  return null;
});

export default StepInput;
