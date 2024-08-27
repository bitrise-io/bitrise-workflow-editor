import { EnvVar } from './EnvVar';

function validateKey(key?: string, keys?: string[]) {
  if (!key || !String(key).trim()) {
    return 'Key is required.';
  }

  if (!/^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number.';
  }

  if (keys?.includes(key)) {
    return 'Key should be unique.';
  }

  return true;
}

function validateValue(value?: string) {
  if (!value || !String(value).trim()) {
    return 'Value is required.';
  }

  return true;
}

function parseYmlEnvVar({ opts, ...env }: { [key: string]: any }, source = ''): EnvVar {
  return {
    source,
    key: Object.keys(env)[0],
    value: Object.values(env)[0],
    isExpand: Boolean(opts?.is_expand),
  };
}

function toYmlValue(value: unknown) {
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

export default {
  validateKey,
  validateValue,
  parseYmlEnvVar,
  toYmlValue,
};
