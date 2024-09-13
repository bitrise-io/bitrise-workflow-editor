import { useState } from 'react';
import { Box, Dropdown, DropdownOption, DropdownProps, forwardRef } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { EnvVar } from '@/core/models/EnvVar';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import InsertEnvVarPopover from './InsertEnvVarPopover/InsertEnvVarPopover';
import StepHelperText from './StepHelperText';
import SensitiveBadge from './SensitiveBadge';

type Props = DropdownProps<string | null> & {
  options: string[];
  helper?: { summary?: string; details?: string };
  isDisabled?: boolean;
  isSensitive?: boolean;
};

const StepSelectInput = forwardRef(
  ({ label, options, isSensitive, isDisabled, helper, helperText, ...props }: Props, ref) => {
    const { workflowId } = useStepDrawerContext();
    const [value, setValue] = useState(props.value ?? props.defaultValue);
    const appendWorkflowEnvVar = useBitriseYmlStore(useShallow((s) => s.appendWorkflowEnvVar));

    const handleChange: DropdownProps<string | null>['onChange'] = (e) => {
      props.onChange?.(e);
      setValue(e.target.value);
    };

    const handleInsertVariable = (key: string) => {
      setValue(`$${key}`);
    };

    const handleCreateEnvVar = (envVar: EnvVar) => {
      appendWorkflowEnvVar(workflowId, envVar);
      handleInsertVariable(envVar.key);
    };

    return (
      <Box display="flex" gap="8">
        <Dropdown
          {...props}
          ref={ref}
          flex="1"
          size="md"
          value={value}
          search={false}
          onChange={handleChange}
          label={
            label && (
              <Box mb="4" display="flex" alignItems="flex-end" justifyContent="space-between">
                <span>{label}</span>
                {isSensitive && <SensitiveBadge />}
              </Box>
            )
          }
          readOnly={isSensitive || isDisabled}
          helperText={helper ? <StepHelperText {...helper} /> : helperText}
        >
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
          <InsertEnvVarPopover
            size="md"
            onCreate={handleCreateEnvVar}
            onSelect={({ key }) => handleInsertVariable(key)}
          />
        </Box>
      </Box>
    );
  },
);

export default StepSelectInput;
