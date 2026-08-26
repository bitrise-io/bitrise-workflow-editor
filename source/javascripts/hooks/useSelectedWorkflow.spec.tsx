/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { initializeModularConfig, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { deepLinkedEntity } from '@/routes';

import useSelectedWorkflow from './useSelectedWorkflow';

function moduleNode(nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path: `${nodeId}.yml`, contents, source: null, commitSha: 'sha', editable: true, includes };
}

/** Bootstrap a modular config the way `main.tsx` does: the URL decides which module opens. */
function initializeModularConfigFromLocation(root: TreeNode) {
  initializeModularConfig({ root, deepLink: deepLinkedEntity(window.parent.location.hash) });
}

describe('useSelectedWorkflow', () => {
  beforeEach(() => {
    updateBitriseYmlDocumentByString(yaml`
      workflows:
        wf1: {}
        wf2: {}
    `);
    window.parent.location.hash = '#/workflows?workflow_id=wf1';
  });

  it('selects the workflow requested in the location hash', () => {
    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf1');
  });

  it('validates against the live hash, so a synchronous hash change is picked up before hashchange fires', () => {
    const { result, rerender } = renderHook(() => useSelectedWorkflow());
    expect(result.current[0]).toBe('wf1');

    // Simulate a synchronous jump-to-definition: the hash is replaced and a re-render
    // happens (e.g. the active file swaps) before the `hashchange` event has fired —
    // the useSearchParams snapshot still holds workflow_id=wf1 at this point.
    window.parent.location.hash = '#/workflows?workflow_id=wf2';
    rerender();

    // A snapshot-based read would lag behind (wf1) and the self-correcting effect
    // would pin wf1 back into the URL, clobbering the jump target.
    expect(result.current[0]).toBe('wf2');
    expect(window.parent.location.hash).toContain('workflow_id=wf2');
  });

  it('falls back to the first runnable workflow and corrects the URL when the requested id is unknown', () => {
    window.parent.location.hash = '#/workflows?workflow_id=does-not-exist';

    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf1');
    expect(window.parent.location.hash).toContain('workflow_id=wf1');
  });

  it('resolves a generated parallel-workflow variant to its original id', () => {
    window.parent.location.hash = '#/workflows?workflow_id=wf2_3';

    const { result } = renderHook(() => useSelectedWorkflow());

    expect(result.current[0]).toBe('wf2');
  });

  describe('in a modular config', () => {
    const root = moduleNode('root', 'workflows:\n  wf1: {}\n', [moduleNode('module', 'workflows:\n  wf3: {}\n')]);

    it('resolves a link to a workflow defined in an included module', () => {
      window.parent.location.hash = '#/workflows?workflow_id=wf3';
      initializeModularConfigFromLocation(root);

      const { result } = renderHook(() => useSelectedWorkflow());

      expect(result.current[0]).toBe('wf3');
      expect(window.parent.location.hash).toContain('workflow_id=wf3');
    });

    it('agrees with the page selector on which value of a duplicated workflow_id wins', () => {
      // Both layers read the same location, so they must resolve a duplicated param identically:
      // if bootstrap took the first value it would open the module for `wf1` while the page
      // selected `wf3`, which is the lost-selection bug this whole path exists to prevent.
      window.parent.location.hash = '#/workflows?workflow_id=wf1&workflow_id=wf3';
      initializeModularConfigFromLocation(root);

      const { result } = renderHook(() => useSelectedWorkflow());

      expect(result.current[0]).toBe('wf3');
      expect(window.parent.location.hash).toContain('workflow_id=wf3');
    });

    it('falls back to the root file when no module defines the linked workflow', () => {
      window.parent.location.hash = '#/workflows?workflow_id=does-not-exist';
      initializeModularConfigFromLocation(root);

      const { result } = renderHook(() => useSelectedWorkflow());

      expect(result.current[0]).toBe('wf1');
      expect(window.parent.location.hash).toContain('workflow_id=wf1');
    });
  });
});
