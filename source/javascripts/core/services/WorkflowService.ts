import { isEmpty } from 'es-toolkit/compat';
import { Document, isMap, isSeq } from 'yaml';

import { Pipelines, Stages, WorkflowModel, Workflows } from '../models/BitriseYml';
import { ChainedWorkflowPlacement } from '../models/Workflow';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';

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
    if (Object.keys(pipeline?.workflows ?? {}).includes(id)) {
      pipelineIdsWhereWorkflowIsUsed.add(pipelineId);
    }

    pipeline?.stages?.forEach((stageObj) => {
      Object.entries(stageObj ?? {}).forEach(([stageId, stage]) => {
        stage?.workflows?.forEach((workflowObj) => {
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
  const workflow = YmlUtils.getMapIn(doc, ['workflows', id]);

  if (!workflow) {
    throw new Error(`Workflow ${id} not found. Ensure that the workflow exists in the 'workflows' section.`);
  }

  return workflow;
}

function createWorkflow(id: string, baseId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['workflows', id])) {
      throw new Error(`Workflow '${id}' already exists`);
    }
    YmlUtils.setIn(doc, ['workflows', id], baseId ? getWorkflowOrThrowError(baseId, doc).clone() : {});
    return doc;
  });
}

function renameWorkflow(id: string, newName: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getWorkflowOrThrowError(id, doc);

    if (doc.hasIn(['workflows', newName])) {
      throw new Error(`Workflow '${newName}' already exists`);
    }

    YmlUtils.updateKeyByPath(doc, ['workflows', id], newName);
    YmlUtils.updateKeyByPath(doc, ['stages', '*', 'workflows', '*', id], newName);
    YmlUtils.updateKeyByPath(doc, ['pipelines', '*', 'workflows', id], newName);
    YmlUtils.updateKeyByPath(doc, ['pipelines', '*', 'stages', '*', '*', 'workflows', '*', id], newName);
    YmlUtils.updateValueByValue(doc, ['trigger_map', '*', 'workflow'], id, newName);
    YmlUtils.updateValueByValue(doc, ['workflows', '*', 'after_run', '*'], id, newName);
    YmlUtils.updateValueByValue(doc, ['workflows', '*', 'before_run', '*'], id, newName);
    YmlUtils.updateValueByValue(doc, ['pipelines', '*', 'workflows', '*', 'uses'], id, newName);
    YmlUtils.updateValueByValue(doc, ['pipelines', '*', 'workflows', '*', 'depends_on', '*'], id, newName);

    return doc;
  });
}

type WK = keyof WorkflowModel;
type WV<T extends WK> = WorkflowModel[T];
function updateWorkflowField<T extends WK>(id: string, field: T, value: WV<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const workflow = getWorkflowOrThrowError(id, doc);

    if (value) {
      YmlUtils.setIn(workflow, [field], value);
    } else {
      YmlUtils.deleteByPath(workflow, [field]);
    }

    return doc;
  });
}

function deleteWorkflow(ids: string | string[]) {
  updateBitriseYmlDocument(({ doc }) => {
    const workflows = Array.isArray(ids) ? [...ids] : [ids];

    workflows.forEach((id) => {
      getWorkflowOrThrowError(id, doc);

      YmlUtils.deleteByPath(doc, ['workflows', id]);
      YmlUtils.deleteByPath(doc, ['stages', '*', 'workflows', '*', id]);
      YmlUtils.deleteByPath(doc, ['pipelines', '*', 'stages', '*', '*', 'workflows', '*', id]);
      YmlUtils.deleteByPath(doc, ['pipelines', '*', 'workflows', id], ['pipelines', '*', 'workflows']);

      YmlUtils.deleteByValue(doc, ['workflows', '*', 'after_run', '*'], id, ['workflows', '*']);
      YmlUtils.deleteByValue(doc, ['workflows', '*', 'before_run', '*'], id, ['workflows', '*']);
      YmlUtils.deleteByValue(doc, ['pipelines', '*', 'workflows', '*', 'depends_on', '*'], id, [
        'pipelines',
        '*',
        'workflows',
        '*',
      ]);

      YmlUtils.deleteByPredicate(doc, ['trigger_map', '*'], (node) => {
        return isMap(node) && node.get('workflow') === id;
      });

      YmlUtils.deleteByPredicate(doc, ['pipelines', '*', 'stages', '*', '*'], (node, path) => {
        return isMap(node) && isEmpty(node.get('workflows')) && isEmpty(doc.getIn(['stages', path[path.length - 1]]));
      });

      YmlUtils.deleteByPredicate(
        doc,
        ['pipelines', '*', 'workflows', '*'],
        (node) => isMap(node) && node.get('uses') === id,
        ['pipelines', '*', 'workflows'],
        (_, path) => {
          YmlUtils.deleteByValue(doc, ['pipelines', '*', 'workflows', '*', 'depends_on', '*'], path[path.length - 1], [
            'pipelines',
            '*',
            'workflows',
            '*',
          ]);
        },
      );
    });

    return doc;
  });
}

function addChainedWorkflow(prentWorkflowId: string, placement: ChainedWorkflowPlacement, chainableWorkflowId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    const parentWorkflow = getWorkflowOrThrowError(prentWorkflowId, doc);
    getWorkflowOrThrowError(chainableWorkflowId, doc);

    YmlUtils.addIn(parentWorkflow, [placement], chainableWorkflowId);

    return doc;
  });
}

function removeChainedWorkflow(
  parentWorkflowId: string,
  placement: ChainedWorkflowPlacement,
  chainedWorkflowId: string,
  chainedWorkflowIndex: number,
) {
  updateBitriseYmlDocument(({ doc }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    const workflow = getWorkflowOrThrowError(parentWorkflowId, doc);

    const chainedWorkflows = YmlUtils.getSeqIn(workflow, [placement]);
    if (!chainedWorkflows || !isSeq(chainedWorkflows)) {
      throw new Error(`Workflow ${parentWorkflowId} does not have a ${placement} workflow chain.`);
    }

    const isChainedWorkflowExists = YmlUtils.isInSeq(chainedWorkflows, [], chainedWorkflowId, chainedWorkflowIndex);
    if (!isChainedWorkflowExists) {
      throw new Error(
        `Workflow ${chainedWorkflowId} is not in the ${placement} workflow chain of ${parentWorkflowId}.`,
      );
    }

    YmlUtils.deleteByPath(workflow, [placement, chainedWorkflowIndex]);

    return doc;
  });
}

function setChainedWorkflows(workflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) {
  updateBitriseYmlDocument(({ doc }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    const workflow = getWorkflowOrThrowError(workflowId, doc);
    const chainedWorkflows = YmlUtils.getSeqIn(workflow, [placement], true);

    chainedWorkflowIds.forEach((chainedWorkflowId, index) => {
      getWorkflowOrThrowError(chainedWorkflowId, doc);
      YmlUtils.setIn(chainedWorkflows, [index], chainedWorkflowId);
    });

    if (chainedWorkflows.items.length > chainedWorkflowIds.length) {
      chainedWorkflows.items = chainedWorkflows.items.slice(0, chainedWorkflowIds.length);
    }

    if (chainedWorkflows.items.length === 0) {
      YmlUtils.deleteByPath(workflow, [placement]);
    }

    return doc;
  });
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
  createWorkflow,
  renameWorkflow,
  updateWorkflowField,
  deleteWorkflow,
  addChainedWorkflow,
  removeChainedWorkflow,
  setChainedWorkflows,
};
