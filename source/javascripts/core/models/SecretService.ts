const KEY_REGEX = /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i;

function validateKey(key?: string, keys?: string[]): boolean | string {
  if (!key || !String(key).trim()) {
    return 'Key is required.';
  }

  if (!KEY_REGEX.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number.';
  }

  if (keys?.includes(key)) {
    return 'Key should be unique.';
  }

  return true;
}

function validateValue(value?: string): boolean | string {
  if (!value || !String(value).trim()) {
    return 'Value is required.';
  }

  return true;
}

export default {
  validateKey,
  validateValue,
};
