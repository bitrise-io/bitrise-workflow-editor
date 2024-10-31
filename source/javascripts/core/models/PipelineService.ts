const PIPELINE_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;

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

export default {
  validateName,
  sanitizeName,
};
