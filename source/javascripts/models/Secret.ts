export type Secret = {
  key: string;
  value: string;
  source: string;
  isExpose: boolean;
  isExpand: boolean;
  isProtected: boolean;
};

export const KEY_IS_REQUIRED = 'Key is required';
export const VALUE_IS_REQUIRED = 'Value is required';

export const KEY_PATTERN = {
  value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
  message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
};

export function isKeyUnique(keys: string[]) {
  return (value: string) => (keys.some((key) => key === value) ? 'Key should be unique.' : true);
}

export function isNotEmpty(value: string) {
  return !!value.trim() || 'Value should not be empty.';
}
