import { BitriseYml } from '@/core/models/BitriseYml';
import { dialogRefsResolve } from '@/hooks/useCloseDialogsOnFileSwitch';

const yml: BitriseYml = {
  format_version: '13',
  workflows: {
    wf1: { steps: [{ 'script@1': {} }, { 'git-clone@8': {} }] },
    empty: {},
  },
  pipelines: {
    pip1: { workflows: { wf1: {} } },
  },
  step_bundles: {
    bundle1: { steps: [{ 'script@1': {} }] },
  },
};

describe('dialogRefsResolve', () => {
  it('resolves when no refs are given', () => {
    expect(dialogRefsResolve(yml, {})).toBe(true);
  });

  it('skips empty and undefined ids', () => {
    expect(dialogRefsResolve(yml, { workflowIds: ['', undefined], stepBundleIds: [''] })).toBe(true);
  });

  it('resolves existing entities', () => {
    expect(dialogRefsResolve(yml, { workflowIds: ['wf1'], pipelineIds: ['pip1'], stepBundleIds: ['bundle1'] })).toBe(
      true,
    );
  });

  it('fails when a workflow is missing', () => {
    expect(dialogRefsResolve(yml, { workflowIds: ['wf1', 'missing'] })).toBe(false);
  });

  it('fails when a pipeline is missing', () => {
    expect(dialogRefsResolve(yml, { pipelineIds: ['missing'] })).toBe(false);
  });

  it('fails when a step bundle is missing', () => {
    expect(dialogRefsResolve(yml, { stepBundleIds: ['missing'] })).toBe(false);
  });

  it('resolves step indices within the workflow steps', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'workflows', sourceId: 'wf1', indices: [0, 1] } })).toBe(true);
  });

  it('fails step indices beyond the workflow steps', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'workflows', sourceId: 'wf1', indices: [2] } })).toBe(false);
  });

  it('fails step indices when the workflow has no steps', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'workflows', sourceId: 'empty', indices: [0] } })).toBe(false);
  });

  it('fails step indices when the container is missing', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'workflows', sourceId: 'missing', indices: [0] } })).toBe(false);
  });

  it('resolves step indices within a step bundle', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'step_bundles', sourceId: 'bundle1', indices: [0] } })).toBe(true);
  });

  it('skips the step check when no indices are selected', () => {
    expect(dialogRefsResolve(yml, { steps: { source: 'workflows', sourceId: 'missing', indices: [] } })).toBe(true);
  });
});
