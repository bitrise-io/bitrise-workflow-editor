import { Box, Dropdown, DropdownOption, DropdownProps, forwardRef } from '@bitrise/bitkit';
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
  ({ label, options, isSensitive, isDisabled, helper, helperText, defaultValue, ...props }: Props, ref) => {
    return (
      <Box display="flex" gap="8">
        <Dropdown
          ref={ref}
          flex="1"
          size="md"
          search={false}
          defaultValue={defaultValue}
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
          {...props}
        >
          {options.map((option) => {
            return (
              <DropdownOption key={option} value={option}>
                {option}
              </DropdownOption>
            );
          })}
          {defaultValue && options.every((optionValue) => optionValue !== defaultValue) && (
            <DropdownOption value={defaultValue}>{defaultValue}</DropdownOption>
          )}
        </Dropdown>
        <Box pt="24">
          <InsertEnvVarPopover
            size="md"
            environmentVariables={[]}
            onOpen={console.log}
            onCreate={console.log}
            onSelect={console.log}
          />
        </Box>
      </Box>
    );
  },
);

export default StepSelectInput;
