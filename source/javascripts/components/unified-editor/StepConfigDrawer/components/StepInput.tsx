import { BitkitIconButton, BitkitTextArea, IconCross, IconRefresh } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { FocusEventHandler, forwardRef, useState } from 'react';

import { EnvVarPopover, SecretPopover } from '@/components/VariablePopover';
import { useIsReadOnlyView } from '@/hooks/useTree';
import { ignore1PasswordProps } from '@/utils/ignore1Password';

import { useStepDrawerContext } from '../StepConfigDrawer.context';
import SensitiveBadge from './SensitiveBadge';
import StepHelperText from './StepHelperText';

type Props = {
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  helperText?: string;
  helper?: { summary?: string; details?: string };
  size?: 'md' | 'lg';
  isRequired?: boolean;
  isSensitive?: boolean;
  isDisabled?: boolean;
  /** Set by a react-hook-form `Controller` field spread. */
  disabled?: boolean;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onChange?: (value: string) => void;
};

type CursorPosition = {
  start: number;
  end: number;
};

function validationErrorIfRequired(value: string, isRequired?: boolean) {
  return isRequired && !value.trim() ? 'This field is required' : undefined;
}

const StepInput = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      name,
      label,
      isSensitive,
      isDisabled,
      disabled,
      helperText,
      helper,
      defaultValue: propDefaultValue,
      onBlur,
      onChange,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const { stepBundleId, workflowId } = useStepDrawerContext();
    const isReadOnlyView = useIsReadOnlyView();
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>();

    const [value, setValue] = useState(String(props.value ?? ''));
    const defaultValue = String(propDefaultValue ?? '');
    const isRequired = defaultValue && !value ? false : props.isRequired;
    const isEditable = !isDisabled && !disabled && !isReadOnlyView;
    const hasHelperText = !!(helper?.summary || helper?.details || helperText);

    const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
      onBlur?.(e);
      setCursorPosition({
        end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
        start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
      });
    };

    const handleValueChange = (newValue: string) => {
      setValue(newValue);
      onChange?.(newValue);
    };

    const insertVariable = (key: string) => {
      const { start, end } = cursorPosition ?? { start: 0, end: value.length };
      const newValue = `${value.slice(0, start)}$${key}${value.slice(end)}`;

      handleValueChange(newValue);
      setCursorPosition({ start, end: end + `$${key}`.length });
    };

    return (
      <Box display="flex" gap="6" flex="1">
        <BitkitTextArea
          ref={ref}
          flex="1"
          autoresize
          rows={1}
          size={size}
          label={label}
          optional={!isRequired}
          value={value}
          state={isSensitive || !isEditable ? 'disabled' : undefined}
          badge={isSensitive ? <SensitiveBadge /> : undefined}
          placeholder={defaultValue || (isSensitive ? 'Add secret' : 'Enter value')}
          errorText={validationErrorIfRequired(value, isRequired)}
          helperText={hasHelperText ? <StepHelperText {...(helper ?? { summary: helperText })} /> : undefined}
          textareaProps={{ ...ignore1PasswordProps, name, fontFamily: 'mono', onBlur: handleBlur }}
          onValueChange={handleValueChange}
        />
        {isEditable && (
          <ButtonGroup gap="6" alignSelf="start" marginBlockStart={label ? '24' : undefined}>
            {!!value && !isSensitive && (
              <BitkitIconButton
                size="md"
                variant="secondary"
                icon={defaultValue ? IconRefresh : IconCross}
                label={defaultValue ? 'Reset to default' : 'Clear'}
                onClick={() => handleValueChange('')}
              />
            )}
            {isSensitive && <SecretPopover size={size} onSelect={({ key }) => insertVariable(key)} />}
            {!isSensitive && (
              <EnvVarPopover
                size={size}
                workflowId={workflowId}
                stepBundleId={stepBundleId}
                onSelect={({ key }) => insertVariable(key)}
              />
            )}
          </ButtonGroup>
        )}
      </Box>
    );
  },
);

StepInput.displayName = 'StepInput';

export default StepInput;
