/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Document, isMap, YAMLSeq } from 'yaml';

import { bitriseYmlStore, getBitriseYml, updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import { EnvironmentItemModel } from '../models/BitriseYml';
import { EnvVar, EnvVarSource } from '../models/EnvVar';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

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

function toYml(envVar: EnvVar): EnvironmentItemModel {
  const envVarYml: EnvironmentItemModel = { [envVar.key]: YmlUtils.toScalar(envVar.value) };

  if (envVar.isExpand === false) {
    envVarYml.opts = { is_expand: false };
  }

  return envVarYml;
}

function getEnvPath(source: EnvVarSource, sourceId?: string, index?: number, key?: string) {
  let path: (string | number)[] = [];

  if (source === EnvVarSource.App) {
    path = ['app', 'envs'];
  }

  if (source === EnvVarSource.Workflows && sourceId) {
    path = ['workflows', sourceId, 'envs'];
  }

  if (source === EnvVarSource.Containers && sourceId) {
    path = ['containers', sourceId, 'envs'];
  }

  if (index !== undefined) {
    path.push(index);
  }

  if (index && key) {
    path.push(key);
  }

  return path;
}

function getWorkflowOrThrowError(doc: Document, at: { sourceId?: string }) {
  if (!at.sourceId) {
    throw new Error('sourceId is required when source is Workflows');
  }

  return WorkflowService.getWorkflowOrThrowError(at.sourceId, doc);
}

function getContainerOrThrowError(doc: Document, at: { sourceId?: string }) {
  if (!at.sourceId) {
    throw new Error('sourceId is required when source is Containers');
  }

  const container = YmlUtils.getMapIn(doc, ['containers', at.sourceId]);

  if (!container || !isMap(container)) {
    throw new Error(
      `Container '${at.sourceId}' not found. Ensure that the container exists in the 'containers' section.`,
    );
  }

  return container;
}

function getSourceOrThrowError(doc: Document, at: { source: EnvVarSource; sourceId?: string }) {
  if (at.source === EnvVarSource.App) {
    const app = YmlUtils.getMapIn(doc, ['app']);

    if (!app || !isMap(app)) {
      throw new Error(`The 'app' section is not found`);
    }

    return app;
  }

  if (at.source === EnvVarSource.Workflows) {
    if (!at.sourceId) {
      throw new Error('sourceId is required when source is Workflows');
    }

    return WorkflowService.getWorkflowOrThrowError(at.sourceId, doc);
  }

  if (at.source === EnvVarSource.Containers) {
    if (!at.sourceId) {
      throw new Error('sourceId is required when source is Containers');
    }

    return getContainerOrThrowError(doc, at);
  }

  throw new Error(`Unsupported source: ${at.source}`);
}

function getEnvVarSeqOrThrowError(doc: Document, at: { source: EnvVarSource; sourceId?: string }): YAMLSeq<unknown> {
  const source = getSourceOrThrowError(doc, at);
  const envs = YmlUtils.getSeqIn(source, ['envs']);

  if (!envs) {
    if (at.source === EnvVarSource.App) {
      throw new Error(`The 'app.envs' section doesn't exist`);
    }
    if (at.source === EnvVarSource.Workflows) {
      throw new Error(`Workflow '${at.sourceId!}' doesn't have an 'envs' section`);
    }
    if (at.source === EnvVarSource.Containers) {
      throw new Error(`Container '${at.sourceId!}' doesn't have an 'envs' section`);
    }

    throw new Error(`The 'envs' section doesn't exist for source: ${at.source}`);
  }

  return envs;
}

function getEnvVarOrThrowError(doc: Document, at: { source: EnvVarSource; sourceId?: string; index: number }) {
  const envs = getEnvVarSeqOrThrowError(doc, at);
  const env = YmlUtils.getMapIn(envs, [at.index]);

  if (!env) {
    if (at.source === EnvVarSource.App) {
      throw new Error(`Project-level environment variable not found, index ${at.index} is out of bounds`);
    }
    if (at.source === EnvVarSource.Workflows) {
      throw new Error(
        `Environment variable not found in Workflow '${at.sourceId}', index ${at.index} is out of bounds`,
      );
    }
    if (at.source === EnvVarSource.Containers) {
      throw new Error(
        `Environment variable not found in Container '${at.sourceId}', index ${at.index} is out of bounds`,
      );
    }

    throw new Error(`Environment variable not found for source: ${at.source}, index ${at.index} is out of bounds`);
  }

  return env;
}

function getAppEnvs() {
  const yml = getBitriseYml();
  const appEnvs = yml.app?.envs || [];
  return appEnvs.map((e) => fromYml(e, 'Project envs'));
}

function getWorkflowEnvs(workflowId: string): EnvVar[] {
  const yml = getBitriseYml();
  const { ymlDocument } = bitriseYmlStore.getState();
  const workflows = yml.workflows || {};

  // Return environment variables from all workflows
  if (workflowId === '*') {
    const allWorkflowEnvs: EnvVar[] = [];

    Object.entries(workflows).forEach(([id, workflow]) => {
      const workflowEnvs = workflow?.envs || [];
      workflowEnvs.forEach((envVar) => {
        allWorkflowEnvs.push(fromYml(envVar, `Workflow: ${id}`));
      });
    });

    return allWorkflowEnvs;
  }

  WorkflowService.getWorkflowOrThrowError(workflowId, ymlDocument);

  // Return environment variables from a specific workflow
  const workflowEnvs = workflows[workflowId]?.envs || [];
  return workflowEnvs.map((envVar) => fromYml(envVar, `Workflow: ${workflowId}`));
}

function getContainerEnvs(containerId: string): EnvVar[] {
  const yml = getBitriseYml();
  const { ymlDocument } = bitriseYmlStore.getState();
  const containers = yml.containers || {};

  // Return environment variables from all containers
  if (containerId === '*') {
    const allContainerEnvs: EnvVar[] = [];

    Object.entries(containers).forEach(([id, container]) => {
      const containerEnvs = container?.envs || [];
      containerEnvs.forEach((envVar) => {
        allContainerEnvs.push(fromYml(envVar, `Container: ${id}`));
      });
    });

    return allContainerEnvs;
  }

  getContainerOrThrowError(ymlDocument, { sourceId: containerId });

  // Return environment variables from a specific container
  const containerEnvs = containers[containerId]?.envs || [];
  return containerEnvs.map((envVar) => fromYml(envVar, `Container: ${containerId}`));
}

/**
 * Get environment variables based on source and source ID
 * @param source - Source of environment variables (Project, Workflow, or Container)
 * @param sourceId - Specific Workflow/Container ID or '*' for all
 * @returns List of environment variables
 */
function getAll(source?: EnvVarSource, sourceId?: string): EnvVar[] {
  // Get project-level environment variables
  if (source === EnvVarSource.App) {
    return getAppEnvs();
  }

  if (source === EnvVarSource.Workflows && sourceId !== '*') {
    getWorkflowOrThrowError(bitriseYmlStore.getState().ymlDocument, { sourceId });
  }

  // Get workflow-specific environment variables
  if (source === EnvVarSource.Workflows && sourceId) {
    return getWorkflowEnvs(sourceId);
  }

  if (source === EnvVarSource.Containers && sourceId !== '*') {
    getContainerOrThrowError(bitriseYmlStore.getState().ymlDocument, { sourceId });
  }

  // Get container-specific environment variables
  if (source === EnvVarSource.Containers && sourceId) {
    return getContainerEnvs(sourceId);
  }

  // Get all environment variables (project, all workflows, and all containers)
  return [...getAppEnvs(), ...getWorkflowEnvs('*'), ...getContainerEnvs('*')];
}

function append(envVar: EnvVar, at: { source: EnvVarSource; sourceId?: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    if (at.source === EnvVarSource.Workflows) {
      getWorkflowOrThrowError(doc, at);
    }

    if (at.source === EnvVarSource.Containers) {
      getContainerOrThrowError(doc, at);
    }

    YmlUtils.addIn(doc, getEnvPath(at.source, at.sourceId), toYml(envVar));

    return doc;
  });
}

function create(at: { source: EnvVarSource; sourceId?: string }): void {
  append({ key: '', value: '', isExpand: false, source: '' }, at);
}

function remove(at: { source: EnvVarSource; sourceId?: string; index: number }) {
  updateBitriseYmlDocument(({ doc }) => {
    getEnvVarOrThrowError(doc, at);

    let keepPath: (string | number)[] = [];
    if (at.source === EnvVarSource.Workflows) {
      keepPath = ['workflows', at.sourceId!];
    } else if (at.source === EnvVarSource.Containers) {
      keepPath = ['containers', at.sourceId!];
    }

    YmlUtils.deleteByPath(doc, getEnvPath(at.source, at.sourceId, at.index), keepPath);

    return doc;
  });
}

function reorder(newIndices: number[], at: { source: EnvVarSource; sourceId?: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const envs = getEnvVarSeqOrThrowError(doc, at);

    if (newIndices.length !== envs.items.length) {
      throw new Error(
        `The number of indices (${newIndices.length}) should match the number of environment variables (${envs.items.length})`,
      );
    }

    envs.items = newIndices.map((i) => envs.get(i));
    return doc;
  });
}

function updateKey(newKey: string, at: { source: EnvVarSource; sourceId?: string; index: number; oldKey: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const env = getEnvVarOrThrowError(doc, at);

    if (!env.has(at.oldKey)) {
      throw new Error(`Environment variable key is not matching "${at.oldKey}"`);
    }

    YmlUtils.updateKeyByPath(env, [at.oldKey], newKey);

    return doc;
  });
}

function updateValue(value: string, at: { source: EnvVarSource; sourceId?: string; index: number; key: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    const env = getEnvVarOrThrowError(doc, at);

    if (!env.has(at.key)) {
      throw new Error(`Environment variable key is not matching "${at.key}"`);
    }

    YmlUtils.updateValueByPath(env, [at.key], value);

    return doc;
  });
}

function updateIsExpand(isExpand: boolean, at: { source: EnvVarSource; sourceId?: string; index: number }) {
  updateBitriseYmlDocument(({ doc }) => {
    const env = getEnvVarOrThrowError(doc, at);

    if (isExpand) {
      YmlUtils.deleteByPath(env, ['opts', 'is_expand']);
    } else {
      YmlUtils.setIn(env, ['opts', 'is_expand'], false);
    }

    return doc;
  });
}

export default {
  validateKey,
  fromYml,
  toYml,
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
