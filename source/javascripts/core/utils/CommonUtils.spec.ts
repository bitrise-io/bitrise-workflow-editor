import { parallelWorkflowSourceId } from './CommonUtils';

describe('parallelWorkflowSourceId', () => {
  it('strips the generated parallel-workflow suffix', () => {
    expect(parallelWorkflowSourceId('sharded-tests_13')).toBe('sharded-tests');
    expect(parallelWorkflowSourceId('build_0')).toBe('build');
  });

  it('strips only the trailing suffix, keeping an id that legitimately ends in `_<n>`', () => {
    expect(parallelWorkflowSourceId('build_2_3')).toBe('build_2');
  });

  it('returns undefined when the id carries no such suffix', () => {
    expect(parallelWorkflowSourceId('build')).toBeUndefined();
    expect(parallelWorkflowSourceId('build_')).toBeUndefined();
    expect(parallelWorkflowSourceId('build_v2')).toBeUndefined();
  });
});
