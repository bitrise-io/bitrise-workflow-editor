import { omit } from 'es-toolkit';
import { StagesYml } from '@/core/models/Stage';
import { PipelineWorkflows, PipelineYmlObject } from './Pipeline';

const PIPELINE_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;
const EMPTY_PIPELINE = { workflows: {} } as PipelineYmlObject;

function isGraph(pipeline: PipelineYmlObject) {
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

function convertToGraphPipeline(pipeline: PipelineYmlObject, stages: StagesYml = {}): PipelineYmlObject {
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

      workflows[workflowName] = previousWorkflows.length
        ? {
            depends_on: previousWorkflows,
          }
        : {};
    });

    // Update previous workflows for next iteration
    previousWorkflows = currentWorkflows.map((workflow) => Object.keys(workflow)[0]);
  });

  return { ...newPipeline, workflows };
}

export default {
  isGraph,
  validateName,
  sanitizeName,
  convertToGraphPipeline,
  EMPTY_PIPELINE,
};
