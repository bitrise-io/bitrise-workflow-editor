import { FocusEventHandler, useState } from 'react';
import { ButtonGroup, forwardRef, IconButton } from '@bitrise/bitkit';
import AutoGrowableInput, { AutoGrowableInputProps } from '@/components/AutoGrowableInput';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { EnvVar } from '@/core/models/EnvVar';
import { useUpsertSecret } from '@/hooks/useSecrets';
import WindowUtils from '@/core/utils/WindowUtils';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepHelperText from './StepHelperText';
import SensitiveBadge from './SensitiveBadge';
import InsertSecretPopover from './InsertSecretPopover/InsertSecretPopover';
import InsertEnvVarPopover from './InsertEnvVarPopover/InsertEnvVarPopover';

type Props = Omit<AutoGrowableInputProps, 'helperText' | 'onChange'> & {
  helperText?: string;
  isClearable?: boolean;
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
  ({ isClearable, isSensitive, isDisabled, helperText, helper, onChange, ...props }: Props, ref) => {
    const { workflowId } = useStepDrawerContext();
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
    const appendWorkflowEnvVar = useBitriseYmlStore((s) => s.appendWorkflowEnvVar);
    const [value, setValue] = useState(String(props.value ?? props.defaultValue ?? ''));

  const { mutate: createSecret } = useUpsertSecret({
      appSlug: WindowUtils.appSlug() ?? '',
      options: {
        onSuccess: ({ key }) => {
          insertVariable(key);
        },
      },
    });

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

    const createEnvVar = (envVar: EnvVar) => {
      window.dispatchEvent(new CustomEvent('workflow::envs::created', { detail: envVar }));
      appendWorkflowEnvVar(workflowId, envVar);
      insertVariable(envVar.key);
    };

    return (
      <AutoGrowableInput
        ref={ref}
        {...props}
        value={value}
        onBlur={handleBlur}
        fontFamily="monospace"
        isDisabled={isSensitive || isDisabled}
        badge={isSensitive ? <SensitiveBadge /> : undefined}
        placeholder={isSensitive ? 'Add secret' : 'Enter value'}
        errorText={validationErrorIfRequired(value, props.isRequired)}
        helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          onChange?.(e.currentTarget.value);
        }}
      >
        {!isDisabled && (
          <ButtonGroup size="sm" spacing="4" top="4" right="4" position="absolute">
            {isClearable && (
              <IconButton
                size="sm"
                variant="tertiary"
                aria-label="Clear"
                iconName="Cross"
                tooltipProps={{ 'aria-label': 'Clear' }}
              />
            )}
            {isSensitive && (
              <InsertSecretPopover size="sm" onCreate={createSecret} onSelect={({ key }) => insertVariable(key)} />
            )}
            {!isSensitive && (
              <InsertEnvVarPopover size="sm" onCreate={createEnvVar} onSelect={({ key }) => insertVariable(key)} />
            )}
          </ButtonGroup>
        )}
      </AutoGrowableInput>
    );
  },
);

export default StepInput;
