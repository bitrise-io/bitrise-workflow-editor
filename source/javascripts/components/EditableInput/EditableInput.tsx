import { ButtonGroup, Input, InputProps } from '@bitrise/bitkit';
import { BitkitControlButton, IconCheck, IconCross, IconPencil } from '@bitrise/bitkit-v2';
import { ChangeEventHandler, KeyboardEventHandler, Reducer, useCallback, useEffect, useReducer } from 'react';

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
  const { size = 'md', value, defaultValue, isDisabled, ...inputProps } = props;
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
    if (isDisabled) {
      return;
    }
    updateEditable({ isEditing: true });
  }, [isDisabled]);

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
    if (isDisabled || editable.validationResult !== true) {
      return;
    }

    onCommit?.(editable.value);
    updateEditable({ committedValue: editable.value, isEditing: false });
  }, [isDisabled, editable.value, editable.validationResult, onCommit]);

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
      isDisabled={isDisabled}
      value={editable.value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      isReadOnly={!editable.isEditing}
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
      errorText={editable.validationResult === true ? undefined : editable.validationResult}
      rightAddonPlacement="inside"
      rightAddon={
        editable.isEditing ? (
          <ButtonGroup mx="8" spacing="0">
            <BitkitControlButton
              size={buttonSize}
              icon={IconCheck}
              label="Change"
              state={editable.validationResult !== true ? 'disabled' : undefined}
              onClick={handleCommit}
            />
            <BitkitControlButton size={buttonSize} label="Cancel" icon={IconCross} onClick={handleCancel} />
          </ButtonGroup>
        ) : (
          <BitkitControlButton
            marginInline="8"
            size={buttonSize}
            label="Edit"
            icon={IconPencil}
            state={isDisabled ? 'disabled' : undefined}
            onClick={handleEdit}
          />
        )
      }
    />
  );
};

export default EditableInput;
