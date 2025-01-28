import { moveStepIndices } from './stepSelectionHandlers';

describe('moveStepIndices', () => {
  test('move a not selected before a selected', () => {
    const result = moveStepIndices('move', [0, 2], 3, 1);
    expect(result).toEqual([0, 3]);
  });

  test('move a selected after a selected', () => {
    const result = moveStepIndices('move', [0, 1], 0, 4);
    expect(result).toEqual([4, 0]);
  });

  test('move a selected before a not selected', () => {
    const result = moveStepIndices('move', [1, 2], 2, 0);
    expect(result).toEqual([2, 0]);
  });

  test('remove a selected', () => {
    const result = moveStepIndices('remove', [0, 2], 0);
    expect(result).toEqual([-1, 1]);
  });

  test('remove a not selected', () => {
    const result = moveStepIndices('remove', [0, 2], 1);
    expect(result).toEqual([0, 1]);
  });

  test('cloen a selected', () => {
    const result = moveStepIndices('clone', [1], 1);
    expect(result).toEqual([2]);
  });

  test('cloen a not selected', () => {
    const result = moveStepIndices('clone', [1], 0);
    expect(result).toEqual([2]);
  });
});
