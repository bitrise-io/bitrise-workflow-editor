import { omit, uniq } from 'es-toolkit';

import { BITRISE_STEP_LIBRARY_URL } from '../models/Step';
import { BitriseYml, PipelineModel, PipelineWorkflows, Stages } from '../models/BitriseYml';

import StepService from './StepService';

const PIPELINE_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;
const EMPTY_PIPELINE = { workflows: {} } as PipelineModel;

function isGraph(pipeline: PipelineModel) {
  return Boolean(pipeline.workflows);
}

function validateName(pipelineName: string, pipelineNames?: string[]) {
  if (!String(pipelineName).trim()) {
    return 'Pipeline name is required.';
  }

  if (!PIPELINE_NAME_REGEX.test(pipelineName)) {
    return 'Pipeline name must only contain letters, numbers, dashes, underscores or periods.';
  }

  if (pipelineNames?.includes(pipelineName)) {
    return 'Pipeline name should be unique.';
  }

  return true;
}

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
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

function getPipeline(id: string, yml: BitriseYml) {
  return yml.pipelines?.[id];
}

function hasStepInside(pipelineId: string, stepId: string, yml: BitriseYml) {
  const pipeline = yml.pipelines?.[pipelineId];

  if (!pipeline || !isGraph(pipeline)) {
    return false;
  }

  return Object.entries(pipeline.workflows ?? {}).some(([workflowId, workflow]) => {
    return yml.workflows?.[workflow.uses || workflowId]?.steps?.some((stepYmlObject) => {
      const cvs = Object.keys(stepYmlObject)[0];
      const { id } = StepService.parseStepCVS(cvs, yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL);
      return id === stepId;
    });
  });
}

export default {
  isGraph,
  getPipeline,
  validateName,
  sanitizeName,
  hasStepInside,
  convertToGraphPipeline,
  EMPTY_PIPELINE,
};
