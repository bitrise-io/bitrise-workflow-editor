import { omit, uniq } from 'es-toolkit';
import { Get, Paths } from 'type-fest';
import { Document, isMap } from 'yaml';

import { BitriseYml, GraphPipelineWorkflowModel, PipelineModel, PipelineWorkflows, Stages } from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import StepService from './StepService';
import WorkflowService from './WorkflowService';

const PIPELINE_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;
const EMPTY_PIPELINE = { workflows: {} } as PipelineModel;

function isIntegerValue(value?: string | number) {
  return Number.isInteger(Number(value));
}

function asIntegerIfPossible(value?: string | number) {
  return isIntegerValue(value) ? Number(value) : value;
}

function isGraph(pipeline: PipelineModel) {
  return Boolean(pipeline.workflows);
}

function getPipeline(id: string, yml: BitriseYml) {
  return yml.pipelines?.[id];
}

function getPipelineType(id: string, yml: BitriseYml): 'graph' | 'staged' | undefined {
  const pipeline = getPipeline(id, yml);

  if (!pipeline) {
    return undefined;
  }

  return isGraph(pipeline) ? 'graph' : 'staged';
}

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(pipelineName: string, initialPipelineName: string, pipelineNames: string[]) {
  if (!pipelineName.trim()) {
    return 'Pipeline name is required';
  }

  if (!PIPELINE_NAME_REGEX.test(pipelineName)) {
    return 'Pipeline name must only contain letters, numbers, dashes, underscores or periods';
  }

  if (pipelineName !== initialPipelineName && pipelineNames?.includes(pipelineName)) {
    return 'Pipeline name should be unique';
  }

  return true;
}

function validateParallel(parallel?: string | number, workflowId?: string, existingWorkflowIds?: string[]) {
  const isEmpty = !parallel && parallel !== 0 && parallel !== '0';
  const isEnvVar = typeof parallel === 'string' && parallel.startsWith('$');
  const isPositiveInteger = isIntegerValue(parallel) && Number(parallel) > 0;

  if (isEmpty) {
    return true;
  }

  if (!isPositiveInteger && !isEnvVar) {
    return 'Parallel copies should be a positive integer or a valid environment variable.';
  }

  if (isPositiveInteger && Number(parallel) > 200) {
    return 'The maximum number of parallel copies is 200.';
  }

  if (isPositiveInteger && workflowId && existingWorkflowIds?.length) {
    const collisions: string[] = [];

    for (let i = 0; i < Number(parallel); i++) {
      const generatedWorkflowId = `${workflowId}_${i}`;
      if (existingWorkflowIds.includes(generatedWorkflowId)) {
        collisions.push(generatedWorkflowId);
      }
    }

    if (collisions.length > 0) {
      return `Cannot create ${parallel} parallel Workflows because the following IDs already exist: ${collisions.join(', ')}.`;
    }
  }

  if (isEnvVar && workflowId && existingWorkflowIds?.length) {
    const collisions: string[] = [];

    existingWorkflowIds.forEach((id) => {
      if (id.match(new RegExp(`^${workflowId}_[0-9]+$`))) {
        collisions.push(id);
      }
    });

    if (collisions.length > 0) {
      return `The environment variable ${parallel} might create Workflow IDs that conflict with existing Workflows: ${collisions.join(', ')}.`;
    }
  }

  return true;
}

function hasStepInside(pipelineId: string, stepId: string, yml: BitriseYml) {
  const pipeline = yml.pipelines?.[pipelineId];

  if (!pipeline || !isGraph(pipeline)) {
    return false;
  }

  return Object.entries(pipeline.workflows ?? {}).some(([workflowId, wf]) => {
    return WorkflowService.getWorkflowChain(yml.workflows ?? {}, wf?.uses || workflowId).some((wfId) => {
      return yml.workflows?.[wfId]?.steps?.some((stepYmlObject) => {
        const cvs = Object.keys(stepYmlObject)[0];
        const { id } = StepService.parseStepCVS(cvs, yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL);
        return id === stepId;
      });
    });
  });
}

function numberOfStages(pipeline: PipelineModel) {
  return pipeline.stages?.length || 0;
}

function convertToGraphPipeline(pipeline: PipelineModel, stages: Stages = {}): PipelineModel {
  if (isGraph(pipeline)) {
    return pipeline;
  }

  if (!pipeline.stages) {
    return EMPTY_PIPELINE;
  }

  const newPipeline = omit(pipeline, ['stages', 'workflows']);
  const workflows: PipelineWorkflows = {};
  let previousWorkflows: string[] = [];

  pipeline.stages.forEach((stageRef) => {
    const stageName = Object.keys(stageRef)[0];
    const stage = stages[stageName];

    // Get all workflows in current stage
    const currentWorkflows = stage?.workflows ?? [];

    // Add each workflow with dependencies if needed
    currentWorkflows.forEach((workflow) => {
      const [workflowName] = Object.keys(workflow);
      const workflowObj = workflow[workflowName];

      workflows[workflowName] = {
        ...(previousWorkflows.length && { depends_on: previousWorkflows }),
        ...(stage?.abort_on_fail !== undefined && {
          abort_on_fail: stage.abort_on_fail,
        }),
        ...(stage?.should_always_run !== undefined && {
          should_always_run: stage.should_always_run ? 'workflow' : 'off',
        }),
        ...(workflowObj?.run_if && {
          run_if: { expression: workflowObj.run_if },
        }),
      };
    });

    // Update previous workflows for next iteration
    previousWorkflows = uniq(currentWorkflows.map((workflow) => Object.keys(workflow)[0]));
  });

  return { ...newPipeline, workflows };
}

function getPipelineOrThrowError(id: string, doc: Document) {
  const pipeline = YmlUtils.getMapIn(doc, ['pipelines', id]);

  if (!pipeline) {
    throw new Error(`Pipeline ${id} not found. Ensure that the pipeline exists in the 'pipelines' section.`);
  }

  return pipeline;
}

function getPipelineWorkflowOrThrowError(pipelineId: string, workflowId: string, doc: Document) {
  const pipeline = getPipelineOrThrowError(pipelineId, doc);
  const workflow = YmlUtils.getMapIn(pipeline, ['workflows', workflowId]);

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found in pipeline ${pipelineId}.`);
  }

  return workflow;
}

function createPipeline(id: string, baseId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (YmlUtils.getMapIn(doc, ['pipelines', id])) {
      throw new Error(`Pipeline ${id} already exists`);
    }

    if (baseId) {
      const basePipelineNode = getPipelineOrThrowError(baseId, doc);
      const basePipelineJson = basePipelineNode.toJSON();

      if (isGraph(basePipelineJson)) {
        YmlUtils.setIn(doc, ['pipelines', id], basePipelineNode.clone());
        return doc;
      }

      const stages = YmlUtils.getMapIn(doc, ['stages'])?.toJSON();
      YmlUtils.setIn(doc, ['pipelines', id], convertToGraphPipeline(basePipelineJson, stages));

      return doc;
    }

    YmlUtils.setIn(doc, ['pipelines', id], EMPTY_PIPELINE);

    return doc;
  });
}

function renamePipeline(id: string, newName: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getPipelineOrThrowError(id, doc);

    if (YmlUtils.getMapIn(doc, ['pipelines', newName])) {
      throw new Error(`Pipeline ${newName} already exists`);
    }

    YmlUtils.updateKeyByPath(doc, ['pipelines', id], newName);
    YmlUtils.updateValueByValue(doc, ['trigger_map', '*', 'pipeline'], id, newName);

    return doc;
  });
}

function deletePipeline(ids: string | string[]) {
  updateBitriseYmlDocument(({ doc }) => {
    const pipelines = Array.isArray(ids)
      ? [...ids].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
      : [ids];

    pipelines.forEach((id) => {
      getPipelineOrThrowError(id, doc);

      const isConnectedToPipeline = (node: unknown) => {
        return isMap(node) && node.get('pipeline') === id;
      };

      YmlUtils.deleteByPath(doc, ['pipelines', id]);
      YmlUtils.deleteByPredicate(doc, ['trigger_map', '*'], isConnectedToPipeline);
    });

    return doc;
  });
}

type PK = keyof PipelineModel;
type PV<T extends PK> = PipelineModel[T];
function updatePipelineField<T extends PK>(id: string, field: T, value: PV<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const pipeline = getPipelineOrThrowError(id, doc);

    if (value) {
      YmlUtils.setIn(pipeline, [field], value);
    } else {
      YmlUtils.deleteByPath(pipeline, [field]);
    }

    return doc;
  });
}

function addWorkflowToPipeline(pipelineId: string, workflowId: string, dependsOn?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getPipelineOrThrowError(pipelineId, doc);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    const workflows = YmlUtils.getMapIn(doc, ['pipelines', pipelineId, 'workflows'], true);

    if (workflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} already exists in pipeline ${pipelineId}.`);
    }

    YmlUtils.unflowEmptyCollection(workflows);

    if (dependsOn) {
      getPipelineWorkflowOrThrowError(pipelineId, dependsOn, doc);
      YmlUtils.setIn(workflows, [workflowId], { depends_on: [dependsOn] });
    } else {
      YmlUtils.setIn(workflows, [workflowId], {});
    }

    return doc;
  });
}

function removeWorkflowFromPipeline(pipelineId: string, workflowId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getPipelineWorkflowOrThrowError(pipelineId, workflowId, doc);

    YmlUtils.deleteByPath(
      doc,
      ['pipelines', pipelineId, 'workflows', workflowId],
      ['pipelines', pipelineId, 'workflows'],
    );

    YmlUtils.deleteByValue(doc, ['pipelines', pipelineId, 'workflows', '*', 'depends_on', '*'], workflowId, [
      'pipelines',
      pipelineId,
      'workflows',
      '*',
    ]);

    return doc;
  });
}

type PWK = Paths<GraphPipelineWorkflowModel>;
type PVV<T extends PWK> = Get<GraphPipelineWorkflowModel, T>;
function updatePipelineWorkflowField<T extends PWK>(pipelineId: string, workflowId: string, field: T, value: PVV<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const workflow = getPipelineWorkflowOrThrowError(pipelineId, workflowId, doc);

    if (value) {
      YmlUtils.setIn(workflow, field.split('.'), value);
    } else {
      YmlUtils.deleteByPath(workflow, field.split('.'));
    }

    return doc;
  });
}

function addPipelineWorkflowDependency(pipelineId: string, workflowId: string, dependsOn: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (dependsOn === workflowId) {
      throw new Error(`Workflow ${workflowId} cannot depend on itself.`);
    }

    const workflow = getPipelineWorkflowOrThrowError(pipelineId, workflowId, doc);
    getPipelineWorkflowOrThrowError(pipelineId, dependsOn, doc);

    if (YmlUtils.isInSeq(workflow, ['depends_on'], dependsOn)) {
      throw new Error(`Workflow ${workflowId} already depends on ${dependsOn}.`);
    }

    YmlUtils.addIn(workflow, ['depends_on'], dependsOn);

    return doc;
  });
}

function removePipelineWorkflowDependency(pipelineId: string, workflowId: string, dependsOn: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const workflow = getPipelineWorkflowOrThrowError(pipelineId, workflowId, doc);
    getPipelineWorkflowOrThrowError(pipelineId, dependsOn, doc);

    if (!YmlUtils.isInSeq(workflow, ['depends_on'], dependsOn)) {
      throw new Error(`Workflow ${workflowId} does not depend on ${dependsOn}.`);
    }

    YmlUtils.deleteByValue(workflow, ['depends_on', '*'], dependsOn);

    return doc;
  });
}

export default {
  isIntegerValue,
  asIntegerIfPossible,
  isGraph,
  getPipeline,
  getPipelineType,
  validateName,
  sanitizeName,
  validateParallel,
  hasStepInside,
  numberOfStages,
  convertToGraphPipeline,
  EMPTY_PIPELINE,
  createPipeline,
  renamePipeline,
  deletePipeline,
  updatePipelineField,
  addWorkflowToPipeline,
  removeWorkflowFromPipeline,
  updatePipelineWorkflowField,
  addPipelineWorkflowDependency,
  removePipelineWorkflowDependency,
};
