const KEY_IS_REQUIRED = 'Key is required';
const KEY_SHOULD_BE_UNIQUE = 'Key should be unique';
const KEY_SHOULD_NOT_BE_EMPTY = 'Key should not be empty';
const KEY_PATTERN = {
  value: /^[a-zA-Z_]([a-zA-Z0-9_]*)?$/i,
  message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
};
const VALUE_IS_REQUIRED = 'Value is required';
const VALUE_SHOULD_NOT_BE_EMPTY = 'Value should not be empty';

function validateKey(items: string[]) {
  return (key: string): boolean | string => {
    if (!key) {
      return KEY_IS_REQUIRED;
    }

    if (!KEY_PATTERN.value.test(key)) {
      return KEY_PATTERN.message;
    }

    if (items.includes(key)) {
      return KEY_SHOULD_BE_UNIQUE;
    }

    if (!key.trim()) {
      return KEY_SHOULD_NOT_BE_EMPTY;
    }

    return true;
  };
}

function validateValue(value?: string): boolean | string {
  if (!value) {
    return VALUE_IS_REQUIRED;
  }

  if (!value.trim()) {
    return VALUE_SHOULD_NOT_BE_EMPTY;
  }

  return true;
}

export default {
  KEY_IS_REQUIRED,
  KEY_PATTERN,
  VALUE_IS_REQUIRED,
  validateKey,
  validateValue,
};
