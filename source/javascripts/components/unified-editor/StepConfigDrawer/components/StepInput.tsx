import { ButtonGroup, forwardRef, IconButton } from '@bitrise/bitkit';
import { FocusEventHandler, useState } from 'react';

import AutoGrowableInput, { AutoGrowableInputProps } from '@/components/AutoGrowableInput';
import { EnvVarPopover, SecretPopover } from '@/components/VariablePopover';
import { EnvVar } from '@/core/models/EnvVar';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useUpsertSecret } from '@/hooks/useSecrets';

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
  ({ isSensitive, isDisabled, helperText, helper, defaultValue: propDefaultValue, onChange, ...props }: Props, ref) => {
    const { stepBundleId, workflowId } = useStepDrawerContext();
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
    const appendWorkflowEnvVar = useBitriseYmlStore((s) => s.appendWorkflowEnvVar);
    const [value, setValue] = useState(String(props.value ?? ''));
    const defaultValue = String(propDefaultValue ?? '');
    const isRequired = defaultValue && !value ? false : props.isRequired;

    const { mutate: createSecret } = useUpsertSecret({
      appSlug: PageProps.appSlug(),
      options: {
        onSuccess: (data) => {
          if (data) {
            insertVariable(data.key);
          }
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
          <ButtonGroup size="sm" spacing="4" top="4" right="4" position="absolute">
            {!!value && !isSensitive && (
              <IconButton
                size="sm"
                variant="tertiary"
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
              <SecretPopover size="sm" onCreate={createSecret} onSelect={({ key }) => insertVariable(key)} />
            )}
            {!isSensitive && (
              <EnvVarPopover
                size="sm"
                onCreate={createEnvVar}
                onSelect={({ key }) => insertVariable(key)}
                stepBundleId={stepBundleId}
                workflowId={workflowId}
              />
            )}
          </ButtonGroup>
        )}
      </AutoGrowableInput>
    );
  },
);

export default StepInput;
