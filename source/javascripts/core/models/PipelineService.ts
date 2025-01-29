import { PipelineYmlObject } from './Pipeline';

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

function convertToGraphPipeline(pipeline: PipelineYmlObject): PipelineYmlObject {
  if (isGraph(pipeline)) {
    return pipeline;
  }

  const { stages, ...newPipeline } = pipeline;

  // TODO: Convert stages to workflows

  return { ...newPipeline, workflows: {} };
}

export default {
  isGraph,
  validateName,
  sanitizeName,
  convertToGraphPipeline,
  EMPTY_PIPELINE,
};
