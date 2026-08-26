import { parallelWorkflowSourceId, searchParamsFromLocation } from './CommonUtils';

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

describe('searchParamsFromLocation', () => {
  it('reads the params of a hash location', () => {
    expect(searchParamsFromLocation('#!/workflows?workflow_id=deploy&tab=configuration')).toEqual({
      workflow_id: 'deploy',
      tab: 'configuration',
    });
  });

  it('takes the last value of a duplicated param', () => {
    expect(searchParamsFromLocation('#!/workflows?workflow_id=first&workflow_id=last')).toEqual({
      workflow_id: 'last',
    });
  });

  it('returns an empty object when there is no query string', () => {
    expect(searchParamsFromLocation('#!/workflows')).toEqual({});
    expect(searchParamsFromLocation('')).toEqual({});
  });
});
