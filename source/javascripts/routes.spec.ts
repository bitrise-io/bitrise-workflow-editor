import { deepLinkedEntity } from './routes';

describe('deepLinkedEntity', () => {
  it('reads the entity a hash location addresses', () => {
    expect(deepLinkedEntity('#!/workflows?workflow_id=test_minimal')).toEqual({
      kind: 'workflows',
      id: 'test_minimal',
    });
    expect(deepLinkedEntity('#!/pipelines?pipeline=nightly')).toEqual({ kind: 'pipelines', id: 'nightly' });
    expect(deepLinkedEntity('#!/step_bundles?step_bundle_id=common')).toEqual({
      kind: 'stepBundles',
      id: 'common',
    });
  });

  it('ignores the other params a link may carry', () => {
    expect(deepLinkedEntity('#!/workflows?tab=configuration&workflow_id=test_minimal&branch=main')).toEqual({
      kind: 'workflows',
      id: 'test_minimal',
    });
  });

  it('accepts a bare router path as well as a raw hash', () => {
    expect(deepLinkedEntity('/workflows?workflow_id=deploy')).toEqual({ kind: 'workflows', id: 'deploy' });
  });

  it('returns undefined when the page carries no entity id', () => {
    expect(deepLinkedEntity('#!/workflows')).toBeUndefined();
    expect(deepLinkedEntity('#!/workflows?branch=main')).toBeUndefined();
    expect(deepLinkedEntity('#!/workflows?workflow_id=')).toBeUndefined();
  });

  it('returns undefined for pages that do not address a single entity', () => {
    expect(deepLinkedEntity('#!/secrets?workflow_id=deploy')).toBeUndefined();
    expect(deepLinkedEntity('#!/yml?workflow_id=deploy')).toBeUndefined();
    expect(deepLinkedEntity('')).toBeUndefined();
  });

  it('does not confuse a pipeline link for a workflow one', () => {
    expect(deepLinkedEntity('#!/pipelines?workflow_id=deploy')).toBeUndefined();
  });

  it('matches the page on a segment boundary, not as a bare prefix', () => {
    expect(deepLinkedEntity('#!/workflows-old?workflow_id=deploy')).toBeUndefined();
    expect(deepLinkedEntity('#!/pipelines_v2?pipeline=nightly')).toBeUndefined();
    expect(deepLinkedEntity('#!/step_bundlesx?step_bundle_id=common')).toBeUndefined();
  });

  it('reads a duplicated param the same way the page selectors do (last value wins)', () => {
    // `URLSearchParams.get()` would take the first value here, while the selectors read the hash
    // through `getSearchParamsFromLocationHash()` and take the last — so bootstrap would open the
    // module for one workflow and the page would then select the other.
    expect(deepLinkedEntity('#!/workflows?workflow_id=module-wf&workflow_id=root-wf')).toEqual({
      kind: 'workflows',
      id: 'root-wf',
    });
    expect(deepLinkedEntity('#!/workflows?workflow_id=module-wf&workflow_id=')).toBeUndefined();
  });

  it('still matches a sub-path of an entity page', () => {
    expect(deepLinkedEntity('#!/workflows/?workflow_id=deploy')).toEqual({ kind: 'workflows', id: 'deploy' });
    expect(deepLinkedEntity('#!/workflows/steps?workflow_id=deploy')).toEqual({ kind: 'workflows', id: 'deploy' });
  });
});
