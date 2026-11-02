import FirstBuildingBlock from './firstBuildingBlock';

describe('firstBuildingBlock', () => {
  it('prefers Pipelines, then runnable Workflows, then Step bundles', () => {
    expect(
      FirstBuildingBlock.firstBuildingBlock({ format_version: '', pipelines: { release: {} }, workflows: { a: {} } }),
    ).toEqual({
      path: '/pipelines',
      param: 'pipeline',
      id: 'release',
    });
    expect(FirstBuildingBlock.firstBuildingBlock({ format_version: '', workflows: { _setup: {}, test: {} } })).toEqual({
      path: '/workflows',
      param: 'workflow_id',
      id: 'test',
    });
    expect(FirstBuildingBlock.firstBuildingBlock({ format_version: '', workflows: { _setup: {} } })?.id).toBe('_setup');
    expect(FirstBuildingBlock.firstBuildingBlock({ format_version: '', step_bundles: { cache: {} } })).toEqual({
      path: '/step_bundles',
      param: 'step_bundle_id',
      id: 'cache',
    });
    expect(FirstBuildingBlock.firstBuildingBlock({ format_version: '' })).toBe(undefined);
  });

  it('tells whether a page has anything in this config', () => {
    const yml = { format_version: '', step_bundles: { cache: {} } };
    expect(FirstBuildingBlock.hasBlocksFor(yml, 'pipelines')).toBe(false);
    expect(FirstBuildingBlock.hasBlocksFor(yml, 'step_bundles')).toBe(true);
    expect(FirstBuildingBlock.hasBlocksFor(yml, 'secrets')).toBe(false);
  });

  it('reads the CI block a URL names, and whether a config still has it', () => {
    const target = FirstBuildingBlock.blockAt('workflows', { workflow_id: 'build', branch: 'main' });
    expect(target).toEqual({ path: '/workflows', param: 'workflow_id', id: 'build' });
    expect(FirstBuildingBlock.blockAt('workflows', {})).toBe(undefined);
    expect(FirstBuildingBlock.blockAt('env_vars', { workflow_id: 'build' })).toBe(undefined);
    expect(FirstBuildingBlock.exists({ format_version: '', workflows: { build: {} } }, target!)).toBe(true);
    expect(FirstBuildingBlock.exists({ format_version: '', workflows: { test: {} } }, target!)).toBe(false);
  });
});
