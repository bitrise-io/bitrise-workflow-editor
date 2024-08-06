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

const StepInput = forwardRef(({ isClearable, isSensitive, isDisabled, helperText, helper, ...props }: Props, ref) => {
  return (
    <AutoGrowableInput
      ref={ref}
      fontFamily="monospace"
      isDisabled={isSensitive || isDisabled}
      badge={isSensitive ? <SensitiveBadge /> : undefined}
      placeholder={isSensitive ? 'Add secret' : 'Enter value'}
      helperText={<StepHelperText {...(helper ?? { summary: helperText })} />}
      {...props}
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
            <InsertEnvVarPopover
              size="sm"
              isLoading={false}
              onCreate={console.log}
              onSelect={console.log}
              environmentVariables={[]}
              onOpen={() => console.log('Load env vars')}
            />
          )}
        </ButtonGroup>
      )}
    </AutoGrowableInput>
  );
});

export default StepInput;
