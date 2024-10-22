import { Box, Dropdown, DropdownOption, DropdownProps, forwardRef } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';
import { EnvVar } from '@/core/models/EnvVar';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepDrawerContext } from '../StepConfigDrawer.context';
import InsertEnvVarPopover from './InsertEnvVarPopover/InsertEnvVarPopover';
import StepHelperText from './StepHelperText';

type Props = DropdownProps<string | null> & {
  options: string[];
  helper?: { summary?: string; details?: string };
  isDisabled?: boolean;
  isSensitive?: boolean;
};

const StepSelectInput = forwardRef(
  ({ label, options, isSensitive, isDisabled, helper, helperText, ...props }: Props, ref) => {
    const { workflowId } = useStepDrawerContext();
    const { watch, setValue } = useFormContext();
    const appendWorkflowEnvVar = useBitriseYmlStore((s) => s.appendWorkflowEnvVar);

    const name = props.name ?? '';
    const value = String(watch(name));

    const insertVariable = (key: string) => {
      setValue(name, `$${key}`, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    };

    const createEnvVar = (envVar: EnvVar) => {
      window.dispatchEvent(new CustomEvent('workflow::envs::created', { detail: envVar }));
      appendWorkflowEnvVar(workflowId, envVar);
      insertVariable(envVar.key);
    };

    return (
      <Box display="flex" gap="8">
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
          <InsertEnvVarPopover size="md" onCreate={createEnvVar} onSelect={({ key }) => insertVariable(key)} />
        </Box>
      </Box>
    );
  },
);

export default StepSelectInput;
