import { EnvVar, EnvVarYml } from './EnvVar';

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

function parseYmlEnvVar({ opts, ...env }: EnvVarYml, source = ''): EnvVar {
  return {
    source,
    key: Object.keys(env)[0],
    value: String(Object.values(env)[0]),
    isExpand: opts?.is_expand !== undefined ? Boolean(opts.is_expand) : undefined,
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

function parseEnvVar(envVar: EnvVar): EnvVarYml {
  let envVarYml = { [envVar.key]: toYmlValue(envVar.value) };

  if (envVar.isExpand !== undefined) {
    envVarYml = { ...envVarYml, opts: { is_expand: Boolean(envVar.isExpand) } };
  }

  return envVarYml;
}

export default {
  validateKey,
  validateValue,
  parseYmlEnvVar,
  parseEnvVar,
  toYmlValue,
};
