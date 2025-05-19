import { Scalar } from 'yaml';

// eslint-disable-next-line import/no-cycle
import { bitriseYmlStore, isWorkflowExists, updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YamlUtils from '@/core/utils/YamlUtils';

import { EnvironmentItemModel } from '../models/BitriseYml';
import { EnvVar, EnvVarSource } from '../models/EnvVar';

const EMPTY_ENV_VAR: EnvVar = {
  key: '',
  value: '',
  isExpand: false,
  source: '',
};

function validateKey(key?: string) {
  if (!key?.trim()) {
    return 'Key is required';
  }

  if (!/^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number';
  }

  return true;
}

function fromYml({ opts, ...env }: EnvironmentItemModel, source = ''): EnvVar {
  const [key, value] = Object.entries(env)[0];
  return {
    source,
    key,
    value: String(value),
    isExpand: opts?.is_expand !== undefined ? Boolean(opts.is_expand) : undefined,
  };
}

function toYmlValue(value: unknown) {
  if (typeof value !== 'string') {
    // Only strings need conversion here
    return value;
  }

  const trimmed = value.trim();
  const lowerValue = trimmed.toLowerCase();

  // 0. Handle empty string
  if (trimmed === '') {
    return '';
  }

  // 1. Null handling
  const nullVals = ['null', '~', ''];
  if (nullVals.includes(lowerValue)) {
    return null;
  }

  // 2. Boolean handling
  const trueVals = ['true', 'yes', 'on'];
  const falseVals = ['false', 'no', 'off'];
  if (trueVals.includes(lowerValue)) {
    return true;
  }
  if (falseVals.includes(lowerValue)) {
    return false;
  }

  // 3. Special floats (.inf, -.inf, .nan)
  if (lowerValue === '.inf') return Infinity;
  if (lowerValue === '-.inf') return -Infinity;
  if (lowerValue === '.nan') return NaN;

  // 4. Treat hex/octal/binary as strings
  // i.e., if starts with 0x, 0o, 0b (case-insensitive), do NOT convert
  if (/^0[xob]/i.test(lowerValue)) {
    return value;
  }

  // 5. Leading zero handling
  // i.e., if starts with 0 and is not a decimal do NOT convert
  // "0123" remains a string, but "0.123" becomes a number
  if (/^0\d+/.test(lowerValue) && !/^0(\.\d+)?$/.test(lowerValue)) {
    return value;
  }

  // 6. Number parsing
  const numberRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
  if (numberRegex.test(lowerValue)) {
    const number = Number(lowerValue);
    if (!Number.isNaN(number)) {
      return number;
    }
  }

  // 6. Else return original string unchanged
  return value;
}

function toYml(envVar: EnvVar): EnvironmentItemModel {
  const envVarYml: EnvironmentItemModel = { [envVar.key]: toYmlValue(envVar.value) };

  if (envVar.isExpand === false) {
    envVarYml.opts = { is_expand: false };
  }

  return envVarYml;
}

function validateSourceId(source?: EnvVarSource, sourceId?: string) {
  if (source === EnvVarSource.Workflow && !sourceId) {
    throw new Error('sourceId is required when source is Workflow');
  }

  if (source === EnvVarSource.Workflow && sourceId && !isWorkflowExists(sourceId)) {
    throw new Error(`Workflow is not found at path: workflows.${sourceId}`);
  }
}

function getEnvPath(source: EnvVarSource, sourceId?: string, index?: number, key?: string) {
  let path: (string | number)[] = [];

  if (source === EnvVarSource.Project) {
    path = ['app', 'envs'];
  }

  if (source === EnvVarSource.Workflow && sourceId) {
    path = ['workflows', sourceId, 'envs'];
  }

  if (index !== undefined) {
    path.push(index);
  }

  if (index && key) {
    path.push(key);
  }

  return path;
}

function getAppEnvs() {
  const { yml } = bitriseYmlStore.getState();
  const appEnvs = yml.app?.envs || [];
  return appEnvs.map((e) => fromYml(e, 'Project envs'));
}

function getWorkflowEnvs(workflowId: string): EnvVar[] {
  const { yml } = bitriseYmlStore.getState();
  const workflows = yml.workflows || {};

  // Return environment variables from all workflows
  if (workflowId === '*') {
    const allWorkflowEnvs: EnvVar[] = [];

    Object.entries(workflows).forEach(([id, workflow]) => {
      const workflowEnvs = workflow.envs || [];
      workflowEnvs.forEach((envVar) => {
        allWorkflowEnvs.push(fromYml(envVar, `Workflow: ${id}`));
      });
    });

    return allWorkflowEnvs;
  }

  validateSourceId(EnvVarSource.Workflow, workflowId);

  // Return environment variables from a specific workflow
  const workflowEnvs = workflows[workflowId]?.envs || [];
  return workflowEnvs.map((envVar) => fromYml(envVar, `Workflow: ${workflowId}`));
}

/**
 * Get environment variables based on source and source ID
 * @param source - Source of environment variables (Project or Workflow)
 * @param sourceId - Specific Workflow ID or '*' for all workflows,
 * @returns List of environment variables
 */
function getAll(source?: EnvVarSource, sourceId?: string): EnvVar[] {
  if (sourceId !== '*') {
    validateSourceId(source, sourceId);
  }

  // Get project-level environment variables
  if (source === EnvVarSource.Project) {
    return getAppEnvs();
  }

  // Get workflow-specific environment variables
  if (source === EnvVarSource.Workflow && sourceId) {
    return getWorkflowEnvs(sourceId);
  }

  // Get all environment variables (both project and all workflows)
  return [...getAppEnvs(), ...getWorkflowEnvs('*')];
}

function append(envVar: EnvVar, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId);
    const envs = YamlUtils.getSeqIn(doc, path, true);
    const env = doc.createNode(toYml(envVar));
    envs.add(env);

    return doc;
  });
}

function create(source: EnvVarSource, sourceId?: string): void {
  append({ key: '', value: '', isExpand: false, source: '' }, source, sourceId);
}

function remove(index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId, index);
    const envs = YamlUtils.getSeqIn(doc, path);

    if (!envs) {
      throw new Error(`Environment variable is not found at path: ${path.join('.')}`);
    }

    YamlUtils.safeDeleteIn(doc, path, source === EnvVarSource.Project ? ['app', 'envs'] : ['envs']);
    return doc;
  });
}

function reorder(newIndices: number[], source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId);
    const envs = YamlUtils.getSeqIn(doc, path);

    if (!envs) {
      throw new Error(`Environment variables not found at path: ${path.join('.')}`);
    }

    if (newIndices.length !== envs.items.length) {
      throw new Error(
        `The number of indices (${newIndices.length}) does not match the number of environment variables (${envs.items.length})`,
      );
    }

    envs.items = newIndices.map((i) => envs.get(i));
    return doc;
  });
}

function updateKey(newKey: string, index: number, oldKey: string, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId, index);
    const env = YamlUtils.getMapIn(doc, path);

    if (!env) {
      throw new Error(`Environment variable is not found at path: ${path.join('.')}`);
    }

    if (!env.has(oldKey)) {
      throw new Error(`Environment variable key mismatch "${oldKey}" at path: ${path.join('.')}`);
    }

    YamlUtils.updateMapKey(env, oldKey, newKey);
    return doc;
  });
}

function updateValue(value: string, index: number, key: string, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId, index);
    const env = YamlUtils.getMapIn(doc, path);

    if (!env) {
      throw new Error(`Environment variable is not found at path: ${path.join('.')}`);
    }

    if (!env.has(key)) {
      throw new Error(`Environment variable key mismatch "${key}" at path: ${path.join('.')}`);
    }

    const ymlValue = toYmlValue(value);

    let scalar = env.get(key, true);
    if (!scalar) {
      scalar = new Scalar(ymlValue);
      scalar.type = Scalar.PLAIN;
    } else {
      scalar.value = ymlValue;
    }

    // If value is number, set the minFractionDigits to the number of digits in the value
    if (typeof ymlValue === 'number' && value.includes('.')) {
      const digits = String(value).split('.')[1].length || 0;
      scalar.minFractionDigits = digits;
    }

    env.setIn([key], scalar);

    return doc;
  });
}

function updateIsExpand(isExpand: boolean, index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, sourceId);

    const path = getEnvPath(source, sourceId, index);
    const env = YamlUtils.getMapIn(doc, path);

    if (!env) {
      throw new Error(`Environment variable is not found at path: ${path.join('.')}`);
    }

    if (isExpand) {
      YamlUtils.safeDeleteIn(doc, [...path, 'opts', 'is_expand'], true);
    } else {
      env.setIn(['opts', 'is_expand'], false);
    }

    return doc;
  });
}

export default {
  validateKey,
  fromYml,
  toYml,
  toYmlValue,
  getAll,
  create,
  append,
  remove,
  updateKey,
  updateValue,
  updateIsExpand,
  reorder,
  EMPTY_ENV_VAR,
};
