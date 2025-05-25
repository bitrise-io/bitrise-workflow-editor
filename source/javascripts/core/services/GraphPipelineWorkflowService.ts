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

  if (isPositiveInteger && Number(parallel) > 500) {
    return 'The maximum number of parallel copies is 500.';
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

function isIntegerValue(value?: string | number) {
  return Number.isInteger(Number(value));
}

function asIntegerIfPossible(value?: string | number) {
  return isIntegerValue(value) ? Number(value) : value;
}

export default {
  isIntegerValue,
  validateParallel,
  asIntegerIfPossible,
};
