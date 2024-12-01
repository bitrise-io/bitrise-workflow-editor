import { Workflows } from '@/core/models/Workflow';

function countInWorkflows(id: string, workflows?: Workflows) {
  const workflowIdsWhereWorkflowIsUsed = new Set<string>();

  Object.entries(workflows ?? {}).forEach(([workflowId, workflow]) => {
    if (Object.keys(workflow.steps ?? {}).includes(id)) {
      workflowIdsWhereWorkflowIsUsed.add(workflowId);
    }
  });

  return workflowIdsWhereWorkflowIsUsed.size;
}

export default { countInWorkflows };
