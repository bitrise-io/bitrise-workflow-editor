export function getUsedByText(usedBy: string[]) {
  switch (usedBy.length) {
    case 0:
      return 'not used by other Workflow';
    case 1:
      return 'used by 1 Workflow';
    default:
      return `used by ${usedBy.length} Workflows`;
  }
}

export function getSortableStepId(workflowId: string, stepIndex: number) {
  return `${workflowId}->${stepIndex}`;
}

export function parseSortableStepId(sortableStepId: string) {
  const [workflowId, stepIndexAsString] = sortableStepId.split('->');
  return { workflowId, stepIndex: Number(stepIndexAsString) };
}
