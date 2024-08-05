import { Checkbox, CheckboxProps, Icon, Toggletip, forwardRef } from '@bitrise/bitkit';

const RegexCheckbox = forwardRef<CheckboxProps, 'input'>((props, ref) => {
  const { ...rest } = props;
  const tooltipLabel =
    "Regular Expression (regex) is a sequence of characters that specifies a match pattern in text. Bitrise uses Ruby's Regexp#match method.";
  return (
    <Checkbox marginBottom="8" ref={ref} {...rest}>
      Use regex pattern
      <Toggletip
        label={tooltipLabel}
        learnMoreUrl="https://docs.ruby-lang.org/en/3.2/Regexp.html#class-Regexp-label-Regexp-23match+Method"
      >
        <Icon name="Info" size="16" marginLeft="5" />
      </Toggletip>
    </Checkbox>
  );
});

export default RegexCheckbox;
