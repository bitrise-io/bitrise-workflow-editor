/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import { useTriggerDefiningNodeIds } from './useTargetBasedTriggers';

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';
const EMPTY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {}, containers: {} };

const leaf = (nodeId: string, path: string, contents: string): TreeNode => ({
  nodeId,
  path,
  contents,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

describe('useTriggerDefiningNodeIds', () => {
  it('lists only the files that actually carry a trigger for a target, not every defining file', () => {
    const root: TreeNode = {
      nodeId: 'root',
      path: 'bitrise.yml',
      contents:
        'workflows:\n' +
        // wf-a is defined here but has no trigger — must NOT be attributed to root.
        '  wf-a:\n    steps: []\n' +
        // wf-b's only trigger lives here.
        '  wf-b:\n    triggers:\n      push:\n        - branch: main\n',
      source: null,
      commitSha: SHA,
      editable: true,
      includes: [
        // wf-a's trigger lives only in the module.
        leaf('n_mod', 'mod.yml', 'workflows:\n  wf-a:\n    triggers:\n      push:\n        - branch: dev\n'),
      ],
    };
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useTriggerDefiningNodeIds());

    expect(result.current.get('workflows#wf-a')).toEqual(['n_mod']);
    expect(result.current.get('workflows#wf-b')).toEqual(['root']);
  });
});
