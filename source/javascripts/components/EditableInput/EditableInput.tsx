import { ChangeEventHandler, KeyboardEventHandler, Reducer, useCallback, useEffect, useReducer } from 'react';
import { ButtonGroup, ControlButton, Input, InputProps } from '@bitrise/bitkit';

type Props = InputProps & {
  onCommit?: (value: string) => void;
  sanitize?: (value: string) => string;
  validate?: (value: string) => true | string;
};

type State = {
  value: string;
  isEditing: boolean;
  committedValue: string;
  validationResult: boolean | string;
};

const defaultValidateFn: Props['validate'] = () => true;
const defaultSanitizeFn: Props['sanitize'] = (value) => value;

const EditableInput = ({ sanitize = defaultSanitizeFn, validate = defaultValidateFn, onCommit, ...props }: Props) => {
  const { size, value, defaultValue, ...inputProps } = props;
  const buttonSize = size === 'lg' ? 'md' : 'sm';

  // TODO maybe useEditable hook from Chakra UI
  const [editable, updateEditable] = useReducer<Reducer<State, Partial<State>>>(
    (state, partial) => ({ ...state, ...partial }),
    {
      isEditing: false,
      value: String(value ?? defaultValue ?? ''),
      committedValue: String(value ?? defaultValue ?? ''),
      validationResult: validate(String(value ?? defaultValue ?? '')),
    },
  );

  useEffect(() => {
    if (value !== undefined) {
      updateEditable({ value: String(value) });
    }
  }, [value]);

  const handleEdit = useCallback(() => {
    updateEditable({ isEditing: true });
  }, []);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const sanitizedValue = sanitize(e.target.value);
      updateEditable({
        value: sanitizedValue,
        validationResult: validate(sanitizedValue),
      });
    },
    [sanitize, validate],
  );

  const handleCancel = useCallback(() => {
    updateEditable({
      value: editable.committedValue,
      isEditing: false,
      validationResult: true,
    });
  }, [editable.committedValue]);

  const handleCommit = useCallback(() => {
    if (editable.validationResult !== true) {
      return;
    }

    onCommit?.(editable.value);
    updateEditable({ committedValue: editable.value, isEditing: false });
  }, [editable.value, editable.validationResult, onCommit]);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (editable.isEditing) {
        e.stopPropagation();
      }

      if (e.key === 'Enter') {
        if (editable.isEditing) {
          handleCommit();
        } else {
          handleEdit();
        }
      }

      if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [editable.isEditing, handleCancel, handleCommit, handleEdit],
  );

  return (
    <Input
      {...inputProps}
      size={size}
      value={editable.value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      isReadOnly={!editable.isEditing}
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
      errorText={editable.validationResult === true ? undefined : editable.validationResult}
      rightAddonPlacement="inside"
      rightAddon={
        editable.isEditing ? (
          <ButtonGroup justifyContent="center" spacing="0" m="5px 8px">
            <ControlButton
              size={buttonSize}
              iconName="Check"
              aria-label="Change"
              isDisabled={editable.validationResult !== true}
              onClick={handleCommit}
            />
            <ControlButton size={buttonSize} aria-label="Cancel" iconName="Cross" onClick={handleCancel} />
          </ButtonGroup>
        ) : (
          <ControlButton m="5px 8px" size={buttonSize} aria-label="Edit" iconName="Pencil" onClick={handleEdit} />
        )
      }
    />
  );
};

export default EditableInput;
