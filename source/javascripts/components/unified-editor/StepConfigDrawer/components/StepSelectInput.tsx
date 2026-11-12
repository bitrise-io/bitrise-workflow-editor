import { BitkitSelect } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { forwardRef, useState } from 'react';

import { EnvVarPopover } from '@/components/VariablePopover';
import { useIsReadOnlyView } from '@/hooks/useTree';

import { useStepDrawerContext } from '../StepConfigDrawer.context';
import StepHelperText from './StepHelperText';

const DEFAULT_ITEM_VALUE = '__default__';

type Props = {
  name?: string;
  label?: string;
  value?: string | null;
  defaultValue?: string | null;
  options: string[];
  helper?: { summary?: string; details?: string };
  helperText?: string;
  isDisabled?: boolean;
  isSensitive?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

const StepSelectInput = forwardRef<HTMLDivElement, Props>(
  ({ label, options, isSensitive, isDisabled, disabled, helper, helperText, onChange, ...props }, ref) => {
    const { stepBundleId, workflowId } = useStepDrawerContext();
    const isReadOnlyView = useIsReadOnlyView();
    const [value, setValue] = useState(props.value ?? props.defaultValue ?? '');

    const selectedValue = value || (props.defaultValue ? DEFAULT_ITEM_VALUE : (props.value ?? ''));
    const items = [
      ...(props.defaultValue ? [{ label: `Default (${props.defaultValue})`, value: DEFAULT_ITEM_VALUE }] : []),
      ...options.map((option) => ({ label: option, value: option })),
      ...(value && !options.includes(value) ? [{ label: value, value }] : []),
    ];

    const handleValueChange = (newValue: string) => {
      setValue(newValue);
      onChange?.(newValue);
    };

    return (
      <Box display="flex" flex={1} gap="6">
        <BitkitSelect
          ref={ref}
          flex="1"
          size="md"
          label={label}
          items={items}
          selectProps={{ lazyMount: true, unmountOnExit: true }}
          value={selectedValue}
          state={isSensitive || isDisabled || disabled || isReadOnlyView ? 'readOnly' : undefined}
          helperText={helper ? <StepHelperText {...helper} /> : helperText}
          onValueChange={(newValue) => handleValueChange(newValue === DEFAULT_ITEM_VALUE ? '' : (newValue ?? ''))}
        />
        {!isReadOnlyView && (
          <Box paddingBlockStart="24">
            <EnvVarPopover
              size="md"
              workflowId={workflowId}
              stepBundleId={stepBundleId}
              onSelect={({ key }) => handleValueChange(`$${key}`)}
            />
          </Box>
        )}
      </Box>
    );
  },
);

StepSelectInput.displayName = 'StepSelectInput';

export default StepSelectInput;
