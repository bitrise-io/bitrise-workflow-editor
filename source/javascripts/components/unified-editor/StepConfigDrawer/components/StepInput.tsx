import { ButtonGroup, forwardRef, IconButton } from '@bitrise/bitkit';
import { FocusEventHandler, useState } from 'react';

import AutoGrowableInput, { AutoGrowableInputProps } from '@/components/AutoGrowableInput';
import { EnvVarPopover, SecretPopover } from '@/components/VariablePopover';

import { useStepDrawerContext } from '../StepConfigDrawer.context';
import SensitiveBadge from './SensitiveBadge';
import StepHelperText from './StepHelperText';

type Props = Omit<AutoGrowableInputProps, 'helperText' | 'onChange'> & {
  helperText?: string;
  isSensitive?: boolean;
  helper?: { summary?: string; details?: string };
  onChange?: (value: string) => void;
};

type CursorPosition = {
  start: number;
  end: number;
};

function validationErrorIfRequired(value: string, isRequired?: boolean) {
  return isRequired && !value.trim() ? 'This field is required' : undefined;
}

const StepInput = forwardRef(
  (
    {
      isSensitive,
      isDisabled,
      helperText,
      helper,
      defaultValue: propDefaultValue,
      onChange,
      size = 'md',
      ...props
    }: Props,
    ref,
  ) => {
    const { stepBundleId, workflowId } = useStepDrawerContext();
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>();

    const [value, setValue] = useState(String(props.value ?? ''));
    const defaultValue = String(propDefaultValue ?? '');
    const isRequired = defaultValue && !value ? false : props.isRequired;

    const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
      props.onBlur?.(e);
      setCursorPosition({
        end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
        start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
      });
    };

    const insertVariable = (key: string) => {
      const { start, end } = cursorPosition ?? { start: 0, end: value.length };
      const newValue = `${value.slice(0, start)}$${key}${value.slice(end)}`;

      setValue(newValue);
      onChange?.(newValue);
      setCursorPosition({ start, end: end + `$${key}`.length });
    };

    return (
      <AutoGrowableInput
        ref={ref}
        {...props}
        size={size}
        value={value}
        onBlur={handleBlur}
        fontFamily="monospace"
        isRequired={isRequired}
        isDisabled={isSensitive || isDisabled}
        badge={isSensitive ? <SensitiveBadge /> : undefined}
        placeholder={defaultValue || (isSensitive ? 'Add secret' : 'Enter value')}
        errorText={validationErrorIfRequired(value, isRequired)}
        helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
        formControlProps={{ flex: 1 }}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          onChange?.(e.currentTarget.value);
        }}
      >
        {!isDisabled && (
          <ButtonGroup size="md" spacing="6">
            {!!value && !isSensitive && (
              <IconButton
                size="md"
                variant="secondary"
                iconName={defaultValue ? 'Refresh' : 'Cross'}
                aria-label={defaultValue ? 'Reset to default' : 'Clear'}
                tooltipProps={{
                  'aria-label': defaultValue ? 'Reset to default' : 'Clear',
                }}
                onClick={() => {
                  setValue('');
                  onChange?.('');
                }}
              />
            )}
            {isSensitive && (
              <SecretPopover size={size as 'sm' | 'md' | 'lg'} onSelect={({ key }) => insertVariable(key)} />
            )}
            {!isSensitive && (
              <EnvVarPopover
                size={size as 'sm' | 'md' | 'lg'}
                workflowId={workflowId}
                stepBundleId={stepBundleId}
                onSelect={({ key }) => insertVariable(key)}
              />
            )}
          </ButtonGroup>
        )}
      </AutoGrowableInput>
    );
  },
);

export default StepInput;
