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
