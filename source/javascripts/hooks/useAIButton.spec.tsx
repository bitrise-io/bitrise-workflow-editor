/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import useAIButton from './useAIButton';

// The CI config expert agent and the workspace enablement are the other two gates; force them on so
// the test isolates the modular gate added in BIVS-3735.
jest.mock('@/core/analytics/SegmentBaseTracking', () => ({ __esModule: true, segmentTrack: jest.fn() }));
jest.mock('@/hooks/useFeatureFlag', () => ({ __esModule: true, default: () => true }));
jest.mock('@/core/utils/PageProps', () => ({
  __esModule: true,
  default: {
    settings: () => ({ ai: { ciConfigExpert: {} } }),
    appSlug: () => 'app-slug',
    app: () => ({}),
  },
}));

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';
const ROOT: TreeNode = {
  nodeId: 'root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: SHA,
  editable: true,
  includes: [],
};

describe('useAIButton', () => {
  it('is visible in a non-modular config', () => {
    bitriseYmlStore.setState({ tree: undefined });

    const { result } = renderHook(() => useAIButton({ action: 'explain_workflow' }));

    expect(result.current.isVisible).toBe(true);
  });

  it('is hidden in a modular config (BIVS-3735)', () => {
    initializeModularConfig({ root: ROOT, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useAIButton({ action: 'explain_workflow' }));

    expect(result.current.isVisible).toBe(false);
  });
});
