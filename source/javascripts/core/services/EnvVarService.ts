import { bitriseYmlStore, updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YamlUtils from '@/core/utils/YamlUtils';

import { EnvironmentItemModel } from '../models/BitriseYml';
import { EnvVar, EnvVarSource } from '../models/EnvVar';

const EMPTY_ENVS_ARRAY: EnvVar[] = [];
const EMPTY_ENV_VAR: EnvVar = {
  key: '',
  value: '',
  isExpand: false,
  source: '',
};

function validateKey(key?: string) {
  if (!key?.trim()) {
    return 'Key is required.';
  }

  if (!/^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i.test(key)) {
    return 'Key should contain letters, numbers, underscores, should not begin with a number.';
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
  if (typeof value === 'string') {
    if (['true', 'false'].includes(value)) {
      return Boolean(value === 'true');
    }

    if (!value.trim().startsWith('+') && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return value;
}

function toYml(envVar: EnvVar): EnvironmentItemModel {
  const envVarYml: EnvironmentItemModel = { [envVar.key]: toYmlValue(envVar.value) };

  if (envVar.isExpand === false) {
    envVarYml.opts = { is_expand: Boolean(envVar.isExpand) };
  }

  return envVarYml;
}

function getEnvVarPath(source: EnvVarSource, sourceId?: string, index?: number, key?: string) {
  let path: (string | number)[] = [];

  if (source === EnvVarSource.Workflow && !sourceId) {
    throw new Error('sourceId is required when source is Workflow');
  }

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
  return appEnvs.map((e) => fromYml(e));
}

// Get all envs from all workflows
function getWorkflowEnvs(sourceId: '*'): EnvVar[];
// Get all envs from a specific workflow
function getWorkflowEnvs(sourceId: string): EnvVar[];
function getWorkflowEnvs(sourceId: string): EnvVar[] {
  const { yml } = bitriseYmlStore.getState();
  const workflows = yml.workflows || {};

  if (sourceId === '*') {
    return Object.entries(workflows).flatMap(([workflowId, workflow]) => {
      const workflowEnvs = workflow.envs || [];
      return workflowEnvs.map((e) => fromYml(e, workflowId));
    });
  }

  const workflowEnvs = workflows[sourceId]?.envs || [];
  return workflowEnvs.map((e) => fromYml(e, sourceId));
}

function getEnvVars(source?: EnvVarSource, sourceId?: string): EnvVar[] {
  if (source === EnvVarSource.Project) {
    return getAppEnvs();
  }

  if (source === EnvVarSource.Workflow && sourceId) {
    return getWorkflowEnvs(sourceId);
  }

  return [...getAppEnvs(), ...getWorkflowEnvs('*')];
}

function append(envVar: EnvVar, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const env = doc.createNode(toYml(envVar));
    const envs = YamlUtils.getSeqIn(doc, getEnvVarPath(source, sourceId), true);
    envs.add(env);
    return doc;
  });
}

function create(source: EnvVarSource, sourceId?: string): void {
  append({ key: '', value: '', isExpand: false, source: '' }, source, sourceId);
}

function remove(index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    YamlUtils.safeDeleteIn(doc, getEnvVarPath(source, sourceId, index));
    return doc;
  });
}

function updateKey(oldKey: string, newKey: string, index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const path = getEnvVarPath(source, sourceId, index);
    const env = YamlUtils.getMapIn(doc, path);
    YamlUtils.updateMapKey(env, oldKey, newKey);
    return doc;
  });
}

function updateValue(key: string, value: string, index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const env = YamlUtils.getMapIn(doc, getEnvVarPath(source, sourceId, index, key));
    env.setIn([key], value);
    return doc;
  });
}

function updateIsExpand(isExpand: boolean, index: number, source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const path = getEnvVarPath(source, sourceId, index);
    const env = YamlUtils.getMapIn(doc, path);

    if (isExpand) {
      YamlUtils.safeDeleteIn(doc, [...path, 'opts', 'is_expand'], true);
    } else {
      env.setIn(['opts', 'is_expand'], false);
    }

    return doc;
  });
}

function reorder(newIndices: number[], source: EnvVarSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const envs = YamlUtils.getSeqIn(doc, getEnvVarPath(source, sourceId));
    envs.items = newIndices.map((i) => envs.get(i));
    return doc;
  });
}

export default {
  validateKey,
  fromYml,
  toYml,
  toYmlValue,
  getEnvVars,
  create,
  append,
  remove,
  updateKey,
  updateValue,
  updateIsExpand,
  reorder,
  EMPTY_ENV_VAR,
};
