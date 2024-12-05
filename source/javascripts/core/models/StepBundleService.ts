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

export default { getDependantWorkflows, getUsedByText };
