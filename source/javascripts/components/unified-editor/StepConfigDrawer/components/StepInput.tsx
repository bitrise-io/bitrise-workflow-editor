import { ChangeEventHandler, FocusEventHandler, useState } from 'react';
import { ButtonGroup, forwardRef, IconButton } from '@bitrise/bitkit';
import AutoGrowableInput, { AutoGrowableInputProps } from '@/components/AutoGrowableInput';
import StepHelperText from './StepHelperText';
import SensitiveBadge from './SensitiveBadge';
import InsertSecretPopover from './InsertSecretPopover/InsertSecretPopover';
import InsertEnvVarPopover from './InsertEnvVarPopover/InsertEnvVarPopover';

type Props = Omit<AutoGrowableInputProps, 'helperText'> & {
  helperText?: string;
  isClearable?: boolean;
  isSensitive?: boolean;
  helper?: { summary?: string; details?: string };
};

type CursorPosition = {
  start: number;
  end: number;
};

const StepInput = forwardRef(({ isClearable, isSensitive, isDisabled, helperText, helper, ...props }: Props, ref) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
  const [value, setValue] = useState(String(props.value ?? props.defaultValue ?? ''));

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
    props.onBlur?.(e);
    setCursorPosition({
      end: Math.max(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
      start: Math.min(e.currentTarget.selectionStart, e.currentTarget.selectionEnd),
    });
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    props.onChange?.(e);
    setValue(e.currentTarget.value);
  };

  const handleInsertVariable = (key: string) => {
    const { start, end } = cursorPosition ?? { start: 0, end: value.length };
    setValue(`${value.slice(0, start)}$${key}${value.slice(end)}`);
    setCursorPosition({ start, end: end + `$${key}`.length });
  };

  return (
    <AutoGrowableInput
      {...props}
      ref={ref}
      value={value}
      onBlur={handleBlur}
      onChange={handleChange}
      fontFamily="monospace"
      isDisabled={isSensitive || isDisabled}
      badge={isSensitive ? <SensitiveBadge /> : undefined}
      placeholder={isSensitive ? 'Add secret' : 'Enter value'}
      helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
    >
      {!isDisabled && (
        <ButtonGroup size="sm" spacing="4" top="4" right="4" position="absolute">
          {isClearable && <IconButton size="sm" iconName="CloseSmall" variant="tertiary" aria-label="Clear" />}
          {isSensitive && (
            <InsertSecretPopover
              size="sm"
              secrets={[]}
              isLoading={false}
              onCreate={console.log}
              onSelect={console.log}
              onOpen={() => console.log('Load secrets')}
            />
          )}
          {!isSensitive && (
            <InsertEnvVarPopover size="sm" onCreate={console.log} onSelect={({ key }) => handleInsertVariable(key)} />
          )}
        </ButtonGroup>
      )}
    </AutoGrowableInput>
  );
});

export default StepInput;
