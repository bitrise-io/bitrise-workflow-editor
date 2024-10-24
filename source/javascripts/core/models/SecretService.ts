const KEY_PATTERN = /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i;

function validateKey(key?: string): string | boolean {
  if (!key || !key.trim()) {
    return 'Key is required';
  }

  if (!KEY_PATTERN.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number.';
  }

  return true;
}

export default {
  validateKey,
};
