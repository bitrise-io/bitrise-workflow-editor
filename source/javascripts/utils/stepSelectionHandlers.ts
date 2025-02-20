type Action = 'move' | 'clone' | 'remove';

// TODO move to core/utils
export const moveStepIndices = (
  action: Action,
  indices: number[],
  stepIndex: number,
  targetIndex: number = -1,
): number[] => {
  switch (action) {
    case 'move':
      return indices.map((i) => {
        if (i === stepIndex) {
          return targetIndex;
        }
        if (stepIndex < targetIndex && i > stepIndex && i <= targetIndex) {
          return i - 1;
        }
        if (stepIndex > targetIndex && i < stepIndex && i >= targetIndex) {
          return i + 1;
        }
        return i;
      });
    case 'clone':
      return indices.map((i) => {
        if (i >= stepIndex) {
          return i + 1;
        }
        return i;
      });
    case 'remove':
      return indices.map((i) => {
        if (i >= stepIndex) {
          return i - 1;
        }
        return i;
      });
    default:
      return indices;
  }
};
