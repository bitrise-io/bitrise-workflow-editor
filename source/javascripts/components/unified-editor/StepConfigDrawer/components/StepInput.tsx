import { FocusEventHandler, useState } from 'react';
import { ButtonGroup, forwardRef, IconButton } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import AutoGrowableInput, { AutoGrowableInputProps } from '@/components/AutoGrowableInput';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { EnvVar } from '@/core/models/EnvVar';
import { useUpdateSecret } from '@/hooks/useSecrets';
import WindowUtils from '@/core/utils/WindowUtils';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
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
  const { workflowId } = useStepDrawerContext();
  const { getValues, setValue } = useFormContext();
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>();
  const appendWorkflowEnvVar = useBitriseYmlStore(useShallow((s) => s.appendWorkflowEnvVar));

  const { mutate: createSecret } = useUpdateSecret({
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
    const name = props.name ?? '';
    const value = String(getValues(name) ?? '');
    const { start, end } = cursorPosition ?? { start: 0, end: value.length };
    const newValue = `${value.slice(0, start)}$${key}${value.slice(end)}`;

    setCursorPosition({ start, end: end + `$${key}`.length });
    setValue(name, newValue, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
      onBlur={handleBlur}
      fontFamily="monospace"
      isDisabled={isSensitive || isDisabled}
      badge={isSensitive ? <SensitiveBadge /> : undefined}
      placeholder={isSensitive ? 'Add secret' : 'Enter value'}
      helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
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
});

export default StepInput;
