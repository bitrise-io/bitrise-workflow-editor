import { Input, InputProps } from '@bitrise/bitkit';

export interface PriorityInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange: (newValue?: number) => void;
  value?: number;
}

const PriorityInput = (props: PriorityInputProps) => {
  const { onChange, value, ...rest } = props;
  return (
    <Input
      type="number"
      helperText="Assign a priority to builds started by this trigger. Enter a value from -100 (lowest) to +100 (highest). This setting overrides the priority assigned to this Workflow."
      min="-100"
      max="100"
      label="Priority"
      onChange={(e) => {
        const parsedValue = parseInt(e.target.value, 10);
        if (parsedValue >= -100 && parsedValue <= 100) {
          onChange(parsedValue);
        } else if (e.target.value === '') {
          onChange(undefined);
        }
      }}
      inputMode="numeric"
      value={value?.toString() || ''}
      {...rest}
    />
  );
};

export default PriorityInput;
