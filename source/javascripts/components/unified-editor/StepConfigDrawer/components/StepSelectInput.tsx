import { Box, Dropdown, DropdownOption, DropdownProps, forwardRef } from '@bitrise/bitkit';
import { useState } from 'react';

import { EnvVarPopover } from '@/components/VariablePopover';
import { EnvVar } from '@/core/models/EnvVar';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepHelperText from './StepHelperText';

type Props = Omit<DropdownProps<string | null>, 'onChange'> & {
  options: string[];
  helper?: { summary?: string; details?: string };
  isDisabled?: boolean;
  isSensitive?: boolean;
  onChange?: (value: string) => void;
};

const StepSelectInput = forwardRef(
  ({ label, options, isSensitive, isDisabled, helper, helperText, onChange, ...props }: Props, ref) => {
    const { stepBundleId, workflowId } = useStepDrawerContext();
    const [value, setValue] = useState(props.value ?? props.defaultValue ?? '');
    const appendWorkflowEnvVar = useBitriseYmlStore((s) => s.appendWorkflowEnvVar);

    const insertVariable = (key: string) => {
      setValue(`$${key}`);
      onChange?.(`$${key}`);
    };

    const createEnvVar = (envVar: EnvVar) => {
      window.dispatchEvent(new CustomEvent('workflow::envs::created', { detail: envVar }));
      appendWorkflowEnvVar(workflowId, envVar);
      insertVariable(envVar.key);
    };

    return (
      <Box display="flex" flex={1} gap="8">
        <Dropdown
          ref={ref}
          {...props}
          flex="1"
          size="md"
          value={value}
          search={false}
          label={label}
          readOnly={isSensitive || isDisabled}
          helperText={helper ? <StepHelperText {...helper} /> : helperText}
          onChange={(e) => {
            setValue(e.target.value ?? '');
            onChange?.(e.target.value ?? '');
          }}
        >
          {props.defaultValue && <DropdownOption value="">Default ({props.defaultValue})</DropdownOption>}
          {options.map((option) => {
            return (
              <DropdownOption key={option} value={option}>
                {option}
              </DropdownOption>
            );
          })}
          {value && options.every((optionValue) => optionValue !== value) && (
            <DropdownOption value={value}>{value}</DropdownOption>
          )}
        </Dropdown>
        <Box pt="24">
          <EnvVarPopover
            size="md"
            onCreate={createEnvVar}
            onSelect={({ key }) => insertVariable(key)}
            stepBundleId={stepBundleId}
            workflowId={workflowId}
          />
        </Box>
      </Box>
    );
  },
);

export default StepSelectInput;
