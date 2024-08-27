import { UniqueIdentifier } from '@dnd-kit/core';

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
