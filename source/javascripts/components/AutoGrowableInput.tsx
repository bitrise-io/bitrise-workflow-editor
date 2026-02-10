import { forwardRef, Text } from '@bitrise/bitkit';
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
} from 'chakra-ui-2--react';
import { ChangeEventHandler, LegacyRef, ReactNode, useRef } from 'react';

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
    size = 'md',
    ...rest
  } = props;

  const styleProps: StyleProps = {
    py: size === 'lg' ? '13px' : '9px',
    px: size === 'lg' ? '15px' : '11px',
    overflowX: 'auto',
    overflowY: 'hidden',
    gridArea: '1 / 1 / 2 / 2',
    whiteSpace: 'preserve nowrap',
  };

  const setInitialReplicatedValue: LegacyRef<HTMLDivElement> = (e) => {
    containerRef.current = e || undefined;
    e?.setAttribute('data-replicated-value', e?.querySelector('textarea')?.value || '');
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChange?.(e);
    containerRef.current?.setAttribute('data-replicated-value', e.target.value);
  };

  return (
    <FormControl {...formControlProps} isRequired={rest.isRequired} textStyle="body/md/regular" isInvalid={!!errorText}>
      {label && (
        <Box display="flex" gap="4">
          <FormLabel mb="4" {...formLabelProps}>
            {label}
          </FormLabel>
          {!rest.isRequired && (
            <Text as="span" color="text/secondary" textStyle="body/md/regular" mb="4">
              (optional)
            </Text>
          )}
        </Box>
      )}

      <Box display="flex" gap="6">
        <Box
          flex="1"
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
          {badge && (
            <Box position="absolute" top="-28px" right="0">
              {badge}
            </Box>
          )}
          <Textarea
            {...rest}
            {...styleProps}
            rows={1}
            ref={ref}
            resize="none"
            onChange={handleChange}
            fontFamily={fontFamily}
            data-1p-ignore
            size={size}
          />
        </Box>
        {children}
      </Box>

      {errorText && <FormErrorMessage {...formErrorMessageProps}>{errorText}</FormErrorMessage>}
      {helperText && <FormHelperText {...formHelperTextProps}>{helperText}</FormHelperText>}
    </FormControl>
  );
});

export type { AutoGrowableInputProps };
export default AutoGrowableInput;
