import { FormControl, FormControlProps, FormErrorMessage, Textarea, TextareaProps } from '@chakra-ui/react';
import { forwardRef } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

type Props = TextareaProps & {
  errorText?: string;
  formControlProps?: FormControlProps;
};

const AutoGrowableInput = forwardRef(({ errorText, formControlProps, ...props }: Props, ref) => {
  const form = useFormContext();
  const value = form.watch(props.name || '');

  return (
    <FormControl
      {...formControlProps}
      display="grid"
      position="relative"
      isInvalid={!!errorText}
      textStyle="body/md/regular"
      data-replicated-value={value}
      _after={{
        w: '100%',
        py: '9px',
        px: '11px',
        maxW: '100%',
        overflow: 'hidden',
        visibility: 'hidden',
        gridArea: '1 / 1 / 2 / 2',
        whiteSpace: 'preserve nowrap',
        content: 'attr(data-replicated-value) " "',
      }}
    >
      <Textarea
        {...props}
        ref={ref}
        py="9px"
        px="11px"
        rows={1}
        resize="none"
        overflowX="auto"
        overflowY="hidden"
        gridArea="1 / 1 / 2 / 2"
        transition="height none"
        whiteSpace="preserve nowrap"
        data-1p-ignore
      />
      {errorText && <FormErrorMessage as="p">{errorText}</FormErrorMessage>}
    </FormControl>
  );
});

export default AutoGrowableInput;
