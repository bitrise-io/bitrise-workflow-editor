import { omit, uniq } from 'es-toolkit';
import { Document } from 'yaml';

import { BitriseYml, PipelineModel, PipelineWorkflows, Stages } from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';
import StepService from './StepService';
import WorkflowService from './WorkflowService';

const PIPELINE_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;
const EMPTY_PIPELINE = { workflows: {} } as PipelineModel;

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

function hasStepInside(pipelineId: string, stepId: string, yml: BitriseYml) {
  const pipeline = yml.pipelines?.[pipelineId];

  if (!pipeline || !isGraph(pipeline)) {
    return false;
  }

  return Object.entries(pipeline.workflows ?? {}).some(([workflowId, { uses }]) => {
    return WorkflowService.getWorkflowChain(yml.workflows ?? {}, uses || workflowId).some((wfId) => {
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
        ...(stage.abort_on_fail !== undefined && {
          abort_on_fail: stage.abort_on_fail,
        }),
        ...(stage.should_always_run !== undefined && {
          should_always_run: stage.should_always_run ? 'workflow' : 'off',
        }),
        ...(workflowObj.run_if && {
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
  const basePipelineNode = YamlUtils.getMapIn(doc, ['pipelines', id]);
  if (!basePipelineNode) {
    throw new Error(`Pipeline ${id} not found. Ensure that the pipeline exists in the 'pipelines' section.`);
  }
  return basePipelineNode;
}

function create(id: string, baseId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    if (baseId) {
      const basePipelineNode = getPipelineOrThrowError(baseId, doc);
      const basePipelineJson = basePipelineNode.toJSON();

      if (isGraph(basePipelineJson)) {
        doc.setIn(['pipelines', id], basePipelineNode.clone());
        return doc;
      }

      const stages = YamlUtils.getMapIn(doc, ['stages'])?.toJSON();
      const newPipelineJson = convertToGraphPipeline(basePipelineJson, stages);
      const newPipelineNode = doc.createNode(newPipelineJson, { aliasDuplicateObjects: false });

      doc.setIn(['pipelines', id], newPipelineNode);
      return doc;
    }

    doc.setIn(['pipelines', id], doc.createNode(EMPTY_PIPELINE));
    return doc;
  });
}

function rename(id: string, newName: string) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    getPipelineOrThrowError(id, doc);
    YamlUtils.updateKey({ doc, paths }, `pipelines.${id}`, newName);
    YamlUtils.updateValue({ doc, paths }, `trigger_map.*.pipeline`, newName, id);
    return doc;
  });
}

export default {
  isGraph,
  getPipeline,
  getPipelineType,
  validateName,
  sanitizeName,
  hasStepInside,
  numberOfStages,
  convertToGraphPipeline,
  EMPTY_PIPELINE,
  create,
  rename,
};
