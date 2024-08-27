import { ChangeEventHandler, LegacyRef, ReactNode, useRef } from 'react';
import {
  Box,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormErrorMessageProps,
  FormHelperText,
  FormHelperTextProps,
  FormLabel,
  FormLabelProps,
  StyleProps,
  Textarea,
  TextareaProps,
} from '@chakra-ui/react';
import { forwardRef } from '@bitrise/bitkit';

type AutoGrowableInputProps = TextareaProps & {
  label?: ReactNode;
  badge?: ReactNode;
  errorText?: ReactNode;
  helperText?: ReactNode;
  formLabelProps?: FormLabelProps;
  formControlProps?: FormControlProps;
  formHelperTextProps?: FormHelperTextProps;
  formErrorMessageProps?: FormErrorMessageProps;
};

const styleProps: StyleProps = {
  py: '9px',
  px: '11px',
  overflowX: 'auto',
  overflowY: 'hidden',
  gridArea: '1 / 1 / 2 / 2',
  whiteSpace: 'preserve nowrap',
};

const AutoGrowableInput = forwardRef((props: AutoGrowableInputProps, ref) => {
  const containerRef = useRef<HTMLDivElement>();

  const {
    label,
    badge,
    children,
    errorText,
    helperText,
    fontFamily,
    formLabelProps,
    formControlProps,
    formHelperTextProps,
    formErrorMessageProps,
    onChange,
    ...rest
  } = props;

  const setInitialReplicatedValue: LegacyRef<HTMLDivElement> = (e) => {
    containerRef.current = e || undefined;
    e?.setAttribute('data-replicated-value', e?.querySelector('textarea')?.value || '');
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChange?.(e);
    containerRef.current?.setAttribute('data-replicated-value', e.target.value);
  };

  return (
    <FormControl {...formControlProps} textStyle="body/md/regular" isInvalid={!!errorText}>
      {label && (
        <Box mb="4" display="flex" alignItems="flex-end" justifyContent="space-between">
          <FormLabel {...formLabelProps}>{label}</FormLabel>
          {badge}
        </Box>
      )}

      <Box
        display="grid"
        position="relative"
        alignContent="start"
        ref={setInitialReplicatedValue}
        _after={{
          ...styleProps,
          fontFamily,
          visibility: 'hidden',
          content: 'attr(data-replicated-value) " "',
        }}
      >
        <Textarea
          {...rest}
          {...styleProps}
          rows={1}
          ref={ref}
          resize="none"
          onChange={handleChange}
          fontFamily={fontFamily}
          data-1p-ignore
        />
        {children}
      </Box>

      {errorText && <FormErrorMessage {...formErrorMessageProps}>{errorText}</FormErrorMessage>}
      {helperText && <FormHelperText {...formHelperTextProps}>{helperText}</FormHelperText>}
    </FormControl>
  );
});

export type { AutoGrowableInputProps };
export default AutoGrowableInput;
