export type EnvVar = {
  key: string;
  value: string;
  source: string;
  isExpand: boolean;
};

export const KEY_IS_REQUIRED = 'Key is required.';
export const VALUE_IS_REQUIRED = 'Value is required.';

export const KEY_PATTERN = {
  value: /^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i,
  message: 'Key should contain letters, numbers, underscores, should not begin with a number.',
};

export function isKeyUnique(keys: string[]) {
  return (value: string) => (keys.some((key) => key === value) ? 'Key should be unique.' : true);
}

export function isNotEmpty(value: unknown) {
  if (value === undefined || value === null || !String(value).trim()) {
    return 'Field should not be empty.';
  }

  return true;
}

export function transformEnvVarFromYml({ opts, ...env }: { [key: string]: any }, source = ''): EnvVar {
  return {
    source,
    key: Object.keys(env)[0],
    value: Object.values(env)[0],
    isExpand: Boolean(opts?.is_expand),
  };
}

export function castEnvVarValueForYml(value: unknown) {
  if (typeof value === 'string') {
    if (['true', 'false'].includes(value)) {
      return Boolean(value === 'true');
    }

    if (value && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return value;
}
