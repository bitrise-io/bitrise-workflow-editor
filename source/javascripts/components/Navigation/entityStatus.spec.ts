import EntityStatus from './entityStatus';

const defined =
  (workflows: string[], stepBundles: string[] = []) =>
  (kind: 'workflows' | 'stepBundles', id: string) =>
    (kind === 'workflows' ? workflows : stepBundles).includes(id);

describe('entityStatus', () => {
  it('flags a Pipeline that runs a missing Workflow, following `uses`', () => {
    const isDefined = defined(['build']);
    expect(EntityStatus.pipelineProblem({ workflows: { build: {}, alias: { uses: 'build' } } }, isDefined)).toBe(
      undefined,
    );
    expect(EntityStatus.pipelineProblem({ workflows: { build: {}, deploy: {} } }, isDefined)).toBe(
      'Runs a Workflow that doesn’t exist',
    );
  });

  it('flags a Pipeline Workflow that waits for one outside the Pipeline', () => {
    expect(
      EntityStatus.pipelineProblem({ workflows: { test: { depends_on: ['build'] } } }, defined(['test', 'build'])),
    ).toBe('Waits for a Workflow that isn’t in this Pipeline');
  });

  it('flags a Workflow that chains or bundles something missing, including inside `with` groups', () => {
    expect(EntityStatus.workflowProblem({ before_run: ['setup'] }, defined([]))).toBe(
      'Chains a Workflow that doesn’t exist',
    );
    expect(
      EntityStatus.workflowProblem({ steps: [{ with: { steps: [{ 'bundle::cache': {} }] } }] }, defined([], [])),
    ).toBe('Uses a Step bundle that doesn’t exist');
    expect(EntityStatus.workflowProblem({ steps: [{ 'bundle::cache': {} }] }, defined([], ['cache']))).toBe(undefined);
  });

  it('collects active trigger types, skipping disabled ones, from both trigger styles', () => {
    const types = EntityStatus.activeTriggerTypes(
      { release: { triggers: { push: [{ branch: 'main' }], tag: [{ name: '*', enabled: false }] } } },
      { pr: { triggers: { enabled: false, pull_request: [{ target_branch: 'main' }] } } },
      [{ push_branch: 'dev', workflow: 'nightly' }],
    );
    expect(types).toEqual({ 'pipelines#release': ['push'], 'workflows#nightly': ['push'] });
  });

  it('summarises trigger types in plain words', () => {
    expect(EntityStatus.triggerSummary(['push'])).toBe('Starts on push');
    expect(EntityStatus.triggerSummary(['push', 'pull_request', 'tag'])).toBe('Starts on push, pull request and tag');
    expect(EntityStatus.triggerSummary([])).toBe(undefined);
  });
});
