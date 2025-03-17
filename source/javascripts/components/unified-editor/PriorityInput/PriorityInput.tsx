import { Input, InputProps, Link } from '@bitrise/bitkit';

export interface PriorityInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange: (newValue?: number) => void;
  value?: number;
  helperText: string;
}

const PriorityInput = (props: PriorityInputProps) => {
  const { onChange, value, helperText, ...rest } = props;
  return (
    <Input
      type="number"
      helperText={
        <>
          {helperText}{' '}
          <Link
            colorScheme="purple"
            href="https://devcenter.bitrise.io/en/builds/configuring-build-settings/build-priority.html"
            isExternal
          >
            Learn more
          </Link>
        </>
      }
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
