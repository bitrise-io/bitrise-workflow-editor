/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import { useFileTabs } from './useFileTabs';

function node(nodeId: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    nodeId,
    path: `${nodeId}.yml`,
    contents: `workflows:\n  ${nodeId}: {}\n`,
    source: null,
    commitSha: 'sha',
    editable: true,
    includes: [],
    ...overrides,
  };
}

function initModularConfig() {
  initializeModularConfig({
    root: node('root', {
      path: 'bitrise.yml',
      contents: 'format_version: "13"\n',
      includes: [node('child-a')],
    }),
    branch: 'feature-x',
    commitSha: 'abc',
  });
}

describe('useFileTabs', () => {
  describe('selectMergedConfig', () => {
    beforeEach(() => {
      initModularConfig();
    });

    // Regression: the branch lives in the ?branch= hash query and drives which branch's config is
    // loaded. A first switch to the (not-yet-visited) merged-config tab lands on the default
    // workflows page, which must carry the query over — otherwise the branch is dropped and the
    // editor snaps back to the default branch.
    it('keeps the ?branch= query when switching to a not-yet-visited merged-config tab', () => {
      window.parent.location.hash = '#!/workflows?branch=feature-x';

      const { result } = renderHook(() => useFileTabs());
      act(() => result.current.selectMergedConfig());

      expect(window.parent.location.hash).toContain('workflows');
      expect(window.parent.location.hash).toContain('branch=feature-x');
    });

    it('does not append a stray query separator when there is no hash query', () => {
      window.parent.location.hash = '#!/workflows';

      const { result } = renderHook(() => useFileTabs());
      act(() => result.current.selectMergedConfig());

      expect(window.parent.location.hash).toBe('#!/workflows');
    });
  });
});
