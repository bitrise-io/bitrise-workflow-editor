import { Checkbox, CheckboxProps, Icon, Link, Tooltip, forwardRef } from '@bitrise/bitkit';

const RegexCheckbox = forwardRef<CheckboxProps, 'input'>((props, ref) => {
  const { ...rest } = props;
  return (
    <Checkbox
      helperText={
        <>
          Bitrise uses Ruby's standard{' '}
          {
            <Link
              href="https://docs.ruby-lang.org/en/3.2/Regexp.html#class-Regexp-label-Regexp-23match+Method"
              target="_blank"
              colorScheme="purple"
            >
              Regexp#match
            </Link>
          }{' '}
          method.
        </>
      }
      marginBottom="8"
      ref={ref}
      {...rest}
    >
      Use regex pattern
      <Tooltip label="Regular Expression (regex) is a sequence of characters that specifies a match pattern in text.">
        <Icon name="Info" size="16" marginLeft="5" />
      </Tooltip>
    </Checkbox>
  );
});

export default RegexCheckbox;
