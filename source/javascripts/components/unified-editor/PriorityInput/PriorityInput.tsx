import { BitkitLink, BitkitNumberInput, BitkitNumberInputProps } from '@bitrise/bitkit-v2';

export type PriorityInputProps = Omit<
  BitkitNumberInputProps,
  'defaultValue' | 'helperText' | 'inputProps' | 'label' | 'onChange' | 'onValueChange' | 'optional' | 'value'
> & {
  onChange: (newValue?: number) => void;
  value?: number;
  helperText: string;
};

const PriorityInput = (props: PriorityInputProps) => {
  const { onChange, value, helperText, ...rest } = props;
  return (
    <BitkitNumberInput
      helperText={
        <>
          {helperText}{' '}
          <BitkitLink
            colorVariant="purple"
            href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuring-build-settings/build-priority.html"
            isExternal
          >
            Learn more
          </BitkitLink>
        </>
      }
      inputProps={{ min: -100, max: 100, allowOverflow: false }}
      label="Priority"
      onValueChange={(newValue) => {
        const parsedValue = parseInt(newValue, 10);
        if (parsedValue >= -100 && parsedValue <= 100) {
          onChange(parsedValue);
        } else if (newValue === '') {
          onChange(undefined);
        }
      }}
      optional
      value={value?.toString() || ''}
      {...rest}
    />
  );
};

export default PriorityInput;
