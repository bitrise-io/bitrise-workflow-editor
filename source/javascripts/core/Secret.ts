type Secret = {
  key: string;
  value: string;
  isProtected: boolean;
  isExpand: boolean;
  isExpose: boolean;
  isKeyChangeable: boolean;
  isShared?: boolean;
};

type SecretWithState = Secret & {
  isEditing: boolean;
  isSaved?: boolean;
};

const KEY_IS_REQUIRED = 'Key is required';
const VALUE_IS_REQUIRED = 'Value is required';
const KEY_PATTERN = {
  value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
  message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
};

function validateSecretKey(key: string): boolean | string {
  if (!key) {
    return KEY_IS_REQUIRED;
  }

  if (!KEY_PATTERN.value.test(key)) {
    return KEY_PATTERN.message;
  }

  return true;
}

function validateSecretValue(value: string): boolean | string {
  if (!value) {
    return VALUE_IS_REQUIRED;
  }

  return true;
}

export { Secret, SecretWithState };
export default {
  validateSecretKey,
  validateSecretValue,
};
