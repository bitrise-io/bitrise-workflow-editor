import { FormControl, FormControlProps, FormErrorMessage, StyleProps, Textarea, TextareaProps } from '@chakra-ui/react';
import { forwardRef } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

type Props = TextareaProps & {
  errorText?: string;
  formControlProps?: FormControlProps;
};

const AutoGrowableInput = forwardRef(({ errorText, formControlProps, ...props }: Props, ref) => {
  const form = useFormContext();
  const value = form.watch(props.name || '');

  const styleProps: StyleProps = {
    py: '9px',
    px: '11px',
    overflowX: 'auto',
    overflowY: 'hidden',
    gridArea: '1 / 1 / 2 / 2',
    whiteSpace: 'preserve nowrap',
  };

  return (
    <FormControl
      {...formControlProps}
      display="grid"
      position="relative"
      isInvalid={!!errorText}
      textStyle="body/md/regular"
      data-replicated-value={value}
      _after={{
        ...styleProps,
        visibility: 'hidden',
        content: 'attr(data-replicated-value) " "',
      }}
    >
      <Textarea {...props} {...styleProps} ref={ref} rows={1} resize="none" transition="height none" data-1p-ignore />
      {errorText && <FormErrorMessage as="p">{errorText}</FormErrorMessage>}
    </FormControl>
  );
});

export default AutoGrowableInput;
