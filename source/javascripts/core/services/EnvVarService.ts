import { EnvironmentItemModel } from '../models/BitriseYml';
import { EnvVar } from '../models/EnvVar';

function validateKey(key?: string) {
  if (!key || !String(key).trim()) {
    return 'Key is required.';
  }

  if (!/^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number.';
  }

  return true;
}

function fromYml({ opts, ...env }: EnvironmentItemModel, source = ''): EnvVar {
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

    if (value && !value.trim().startsWith('+') && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return value;
}

function toYml(envVar: EnvVar): EnvironmentItemModel {
  let envVarYml = { [envVar.key]: toYmlValue(envVar.value) };

  if (envVar.isExpand !== undefined) {
    envVarYml = { ...envVarYml, opts: { is_expand: Boolean(envVar.isExpand) } };
  }

  return envVarYml;
}

export default {
  validateKey,
  fromYml,
  toYml,
  toYmlValue,
};
