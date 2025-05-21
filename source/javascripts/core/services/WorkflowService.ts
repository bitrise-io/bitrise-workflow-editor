import { isEmpty } from 'es-toolkit/compat';
import { Document, isMap, isScalar, isSeq } from 'yaml';

import { Pipelines, Stages, WorkflowModel, Workflows } from '../models/BitriseYml';
import { ChainedWorkflowPlacement } from '../models/Workflow';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
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

function createWorkflow(id: string, baseId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['workflows', id])) {
      throw new Error(`Workflow ${id} already exists. Please choose a different name.`);
    }
    doc.setIn(['workflows', id], baseId ? getWorkflowOrThrowError(baseId, doc).clone() : doc.createNode({}));
    return doc;
  });
}

function renameWorkflow(id: string, newName: string) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    getWorkflowOrThrowError(id, doc);
    YamlUtils.updateKey({ doc, paths }, `workflows.${id}`, newName);
    YamlUtils.updateKey({ doc, paths }, `stages.*.workflows.*.${id}`, newName);
    YamlUtils.updateKey({ doc, paths }, `pipelines.*.workflows.${id}`, newName);
    YamlUtils.updateKey({ doc, paths }, `pipelines.*.stages.*.workflows.*.${id}`, newName);
    YamlUtils.updateValue({ doc, paths }, 'trigger_map.*.workflow', newName, id);
    YamlUtils.updateValue({ doc, paths }, 'workflows.*.after_run.*', newName, id);
    YamlUtils.updateValue({ doc, paths }, 'workflows.*.before_run.*', newName, id);
    YamlUtils.updateValue({ doc, paths }, 'pipelines.*.workflows.*.uses', newName, id);
    YamlUtils.updateValue({ doc, paths }, 'pipelines.*.workflows.*.depends_on.*', newName, id);
    return doc;
  });
}

type WK = keyof WorkflowModel;
type WV<T extends WK> = WorkflowModel[T];
function updateWorkflowField<T extends WK>(id: string, field: T, value: WV<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const workflow = getWorkflowOrThrowError(id, doc);

    if (value) {
      workflow.flow = false;
      workflow.set(field, value);
    } else {
      workflow.delete(field);
    }

    return doc;
  });
}

function deleteWorkflow(ids: string | string[]) {
  const isUsesWorkflow = (workflowId: string) => (node: unknown) => {
    return isMap(node) && node.get('uses') === workflowId;
  };

  const isTriggerWorkflow = (workflowId: string) => (node: unknown) => {
    return isMap(node) && node.get('workflow') === workflowId;
  };

  const isPipelineStageHasNoWorkflows = (stageId: string) => (node: unknown) => {
    if (!isMap(node)) {
      return false;
    }

    const stage = node.get(stageId);
    if (!isMap(stage)) {
      return false;
    }

    return isEmpty(stage.get('workflows'));
  };

  updateBitriseYmlDocument((ctx) => {
    const workflows = Array.isArray(ids) ? [...ids] : [ids];

    workflows.forEach((id) => {
      getWorkflowOrThrowError(id, ctx.doc);

      YamlUtils.deleteNodeByPath(ctx, `workflows.${id}`, `*`);
      YamlUtils.deleteNodeByPath(ctx, `pipelines.*.workflows.${id}`, `pipelines.*.workflows.*`);
      YamlUtils.deleteNodeByPath(ctx, `pipelines.*.stages.*.workflows.*.${id}`, `*`);

      YamlUtils.deleteNodeByValue(ctx, `trigger_map.*`, isTriggerWorkflow(id), `*`);
      YamlUtils.deleteNodeByValue(ctx, `workflows.*.after_run.*`, id, `workflows.*.after_run`);
      YamlUtils.deleteNodeByValue(ctx, `workflows.*.before_run.*`, id, `workflows.*.before_run`);

      YamlUtils.deleteNodeByValue(
        ctx,
        `pipelines.*.workflows.*.depends_on.*`,
        id,
        `pipelines.*.workflows.*.depends_on`,
      );

      YamlUtils.deleteNodeByPath(ctx, `stages.*.workflows.*.${id}`, `*`, (path) => {
        if (/^stages\.[^.]+$/.test(YamlUtils.toDotNotation(path))) {
          const stageId = path[path.length - 1];
          YamlUtils.deleteNodeByValue(ctx, `pipelines.*.stages.*`, isPipelineStageHasNoWorkflows(stageId), `*`);
        }
      });

      YamlUtils.deleteNodeByValue(
        ctx,
        `pipelines.*.workflows.*`,
        isUsesWorkflow(id),
        `pipelines.*.workflows`,
        (path) => {
          if (/^pipelines\.[^.]+\.workflows\.[^.]+$/.test(YamlUtils.toDotNotation(path))) {
            const dependantWorkflowId = path[path.length - 1];
            YamlUtils.deleteNodeByValue(
              ctx,
              `pipelines.*.workflows.*.depends_on.*`,
              dependantWorkflowId,
              `pipelines.*.workflows.*.depends_on`,
            );
          }
        },
      );
    });

    return ctx.doc;
  });
}

function addChainedWorkflow(prentWorkflowId: string, placement: ChainedWorkflowPlacement, chainableWorkflowId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    getWorkflowOrThrowError(prentWorkflowId, doc);
    getWorkflowOrThrowError(chainableWorkflowId, doc);

    YamlUtils.getSeqIn(doc, ['workflows', prentWorkflowId, placement], true).add(doc.createNode(chainableWorkflowId));

    return doc;
  });
}

function removeChainedWorkflow(
  parentWorkflowId: string,
  placement: ChainedWorkflowPlacement,
  chainedWorkflowId: string,
  chainedWorkflowIndex: number,
) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    getWorkflowOrThrowError(parentWorkflowId, doc);

    const chainedWorkflows = YamlUtils.getSeqIn(doc, ['workflows', parentWorkflowId, placement]);
    if (!chainedWorkflows || !isSeq(chainedWorkflows)) {
      throw new Error(`Workflow ${parentWorkflowId} does not have a ${placement} workflow chain.`);
    }

    const isChainedWorkflowExists = chainedWorkflows.items.some((item, index) => {
      return isScalar(item) && item.value === chainedWorkflowId && index === chainedWorkflowIndex;
    });

    if (!isChainedWorkflowExists) {
      throw new Error(
        `Workflow ${chainedWorkflowId} is not in the ${placement} workflow chain of ${parentWorkflowId}.`,
      );
    }

    YamlUtils.deleteNodeByPath(
      { doc, paths },
      `workflows.${parentWorkflowId}.${placement}.${chainedWorkflowIndex}`,
      `workflows.*`,
    );

    return doc;
  });
}

function setChainedWorkflows(workflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) {
  updateBitriseYmlDocument(({ doc }) => {
    if (placement !== 'before_run' && placement !== 'after_run') {
      throw new Error(`Invalid placement: ${placement}. It should be 'before_run' or 'after_run'.`);
    }

    getWorkflowOrThrowError(workflowId, doc);

    const chainedWorkflowSequence = YamlUtils.getSeqIn(doc, ['workflows', workflowId, placement], true);

    chainedWorkflowIds.forEach((chainedWorkflowId, index) => {
      getWorkflowOrThrowError(chainedWorkflowId, doc);

      if (chainedWorkflowSequence.get(index)) {
        chainedWorkflowSequence.set(index, chainedWorkflowId);
      } else {
        chainedWorkflowSequence.add(doc.createNode(chainedWorkflowId));
      }
    });

    if (chainedWorkflowSequence.items.length > chainedWorkflowIds.length) {
      chainedWorkflowSequence.items = chainedWorkflowSequence.items.slice(0, chainedWorkflowIds.length);
    }

    if (chainedWorkflowSequence.items.length === 0) {
      YamlUtils.deleteNodeByPath(
        { doc, paths: YamlUtils.collectPaths(doc.toJSON()) },
        `workflows.${workflowId}.${placement}`,
        `workflows.*.*`,
      );
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
