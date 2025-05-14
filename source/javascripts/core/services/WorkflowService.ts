import { Document } from 'yaml';

import { Pipelines, Stages, Workflows } from '../models/BitriseYml';
import YamlUtils from '../utils/YamlUtils';

const WORKFLOW_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(workflowName: string, initialWorkflowName: string, workflowNames: string[]) {
  if (!workflowName.trim()) {
    return 'Workflow name is required';
  }

  if (!WORKFLOW_NAME_REGEX.test(workflowName)) {
    return 'Workflow name must only contain letters, numbers, dashes, underscores or periods';
  }

  if (workflowName !== initialWorkflowName && workflowNames?.includes(workflowName)) {
    return 'Workflow name should be unique';
  }

  return true;
}

function isUtilityWorkflow(workflowId: string) {
  return Boolean(workflowId?.startsWith('_'));
}

function getUsedByText(usedBy: string[]) {
  switch (usedBy.length) {
    case 0:
      return 'Not used by other Workflow';
    case 1:
      return 'Used by 1 Workflow';
    default:
      return `Used by ${usedBy.length} Workflows`;
  }
}

function getBeforeRunChain(workflows: Workflows, id: string): string[] {
  const ids = workflows?.[id]?.before_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...getBeforeRunChain(workflows, currentId),
        currentId,
        ...getAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
}

function getAfterRunChain(workflows: Workflows, id: string): string[] {
  const ids = workflows?.[id]?.after_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...getBeforeRunChain(workflows, currentId),
        currentId,
        ...getAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
}

function getWorkflowChain(workflows: Workflows, id: string): string[] {
  if (!workflows?.[id]) {
    return [];
  }

  const beforeRuns = getBeforeRunChain(workflows, id);
  const afterRuns = getAfterRunChain(workflows, id);
  return [beforeRuns, id, afterRuns].flat();
}

function getAllWorkflowChains(workflows: Workflows): Record<string, string[]> {
  return Object.keys(workflows || {}).reduce<Record<string, string[]>>((chains, id) => {
    // eslint-disable-next-line no-param-reassign
    chains[id] = getWorkflowChain(workflows, id);
    return chains;
  }, {});
}

function getChainableWorkflows(workflows: Workflows, id: string): string[] {
  const workflowChains = getAllWorkflowChains(workflows);
  return Object.entries(workflowChains).reduce<string[]>((chainableWorkflows, [workflowId, chain]) => {
    if (!chain.includes(id)) {
      return [...chainableWorkflows, workflowId];
    }
    return chainableWorkflows;
  }, []);
}

function getDependantWorkflows(workflows: Workflows, id: string): string[] {
  if (!workflows?.[id]) {
    return [];
  }

  const workflowChains = getAllWorkflowChains(workflows);
  return Object.entries(workflowChains).reduce<string[]>((dependants, [workflowId, chain]) => {
    if (chain.includes(id) && id !== workflowId) {
      return [...dependants, workflowId];
    }
    return dependants;
  }, []);
}

function countInPipelines(id: string, pipelines?: Pipelines, stages?: Stages) {
  const pipelineIdsWhereWorkflowIsUsed = new Set<string>();

  Object.entries(pipelines ?? {}).forEach(([pipelineId, pipeline]) => {
    if (Object.keys(pipeline.workflows ?? {}).includes(id)) {
      pipelineIdsWhereWorkflowIsUsed.add(pipelineId);
    }

    pipeline.stages?.forEach((stageObj) => {
      Object.entries(stageObj ?? {}).forEach(([stageId, stage]) => {
        stage.workflows?.forEach((workflowObj) => {
          if (Object.keys(workflowObj ?? {}).includes(id)) {
            pipelineIdsWhereWorkflowIsUsed.add(pipelineId);
          }
        });

        stages?.[stageId]?.workflows?.forEach((workflowObj) => {
          if (Object.keys(workflowObj ?? {}).includes(id)) {
            pipelineIdsWhereWorkflowIsUsed.add(pipelineId);
          }
        });
      });
    });
  });

  return pipelineIdsWhereWorkflowIsUsed.size;
}

function getWorkflowOrThrowError(id: string, doc: Document) {
  const workflow = YamlUtils.getMapIn(doc, ['workflows', id]);

  if (!workflow) {
    throw new Error(`Workflow ${id} not found. Ensure that the workflow exists in the 'workflows' section.`);
  }

  return workflow;
}

export default {
  validateName,
  sanitizeName,
  isUtilityWorkflow,
  getUsedByText,
  getBeforeRunChain,
  getAfterRunChain,
  getWorkflowChain,
  getAllWorkflowChains,
  getChainableWorkflows,
  getDependantWorkflows,
  countInPipelines,
  getWorkflowOrThrowError,
};
