import { Workflows } from '@/core/models/Workflow';

function getDependantWorkflows(workflows: Workflows, id: string) {
  const workflowIdsWhereWorkflowIsUsed = new Set<string>();

  Object.entries(workflows ?? {}).forEach(([workflowId, workflow]) => {
    workflow.steps?.forEach((workflowObj) => {
      if (Object.keys(workflowObj)[0] === id) {
        workflowIdsWhereWorkflowIsUsed.add(workflowId);
      }
    });
  });

  return Array.from(workflowIdsWhereWorkflowIsUsed);
}

function getUsedByText(count: number) {
  switch (count) {
    case 0:
      return 'Not used by any Workflows';
    case 1:
      return 'Used in 1 Workflow';
    default:
      return `Used by ${count} Workflows`;
  }
}

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(newStepBundleName: string, initStepBundleName: string, stepBundleNames?: string[]) {
  const WORKFLOW_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;

  if (!String(newStepBundleName).trim()) {
    return 'Step bundle name is required';
  }

  if (!WORKFLOW_NAME_REGEX.test(newStepBundleName)) {
    return 'Step bundle name must only contain letters, numbers, dashes, underscores or periods';
  }

  if (newStepBundleName !== initStepBundleName && stepBundleNames?.includes(newStepBundleName)) {
    return 'Step bundle name should be unique.';
  }

  return true;
}

export default { getDependantWorkflows, getUsedByText, sanitizeName, validateName };
