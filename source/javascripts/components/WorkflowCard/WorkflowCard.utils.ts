import { UniqueIdentifier } from '@dnd-kit/core';

export function getUsedByText(usedBy: string[]) {
  switch (usedBy.length) {
    case 0:
      return 'Not used by other Workflow';
    case 1:
      return 'Used by 1 Workflow';
    default:
      return `Used by ${usedBy.length} Workflows`;
  }
}

export function getSortableStepId(workflowId: string, stepIndex: number) {
  return `${workflowId}->${stepIndex}`;
}

export function parseSortableStepId(sortableStepId: string) {
  const [workflowId, stepIndexAsString] = sortableStepId.split('->');

  return {
    workflowId,
    stepIndex: Number(stepIndexAsString),
  };
}

export function isSortableStepId(id: UniqueIdentifier): boolean {
  return /^([A-Za-z0-9_]+)->([0-9]+)$/g.test(id.toString());
}
