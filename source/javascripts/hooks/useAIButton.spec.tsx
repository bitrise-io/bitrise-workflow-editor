/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { CiConfigExpertAvailability } from '@/typings/globals';

import useAIButton from './useAIButton';

let availability: CiConfigExpertAvailability | undefined = 'enabled';

jest.mock('@/core/analytics/SegmentBaseTracking', () => ({ __esModule: true, segmentTrack: jest.fn() }));
jest.mock('@/core/utils/PageProps', () => ({
  __esModule: true,
  default: {
    settings: () => ({ ai: { ciConfigExpert: { availability } } }),
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

const renderAIButton = () => renderHook(() => useAIButton({ action: 'explain_workflow' })).result.current;

describe('useAIButton', () => {
  beforeEach(() => {
    availability = 'enabled';
    bitriseYmlStore.setState({ tree: undefined });
  });

  it('is visible in a non-modular config', () => {
    expect(renderAIButton().isVisible).toBe(true);
  });

  it('is hidden in a modular config (BIVS-3735)', () => {
    initializeModularConfig({ root: ROOT, branch: 'main', commitSha: SHA });

    expect(renderAIButton().isVisible).toBe(false);
  });

  describe('availability', () => {
    it('hides every entry point when the agent is not available for the workspace', () => {
      availability = 'unavailable';

      expect(renderAIButton().isVisible).toBe(false);
    });

    it('hides every entry point when AI is switched off for the workspace', () => {
      availability = 'disabled-by-workspace';

      expect(renderAIButton().isVisible).toBe(false);
    });

    it('points at the project settings when the project has not opted in', () => {
      availability = 'disabled-by-project';

      const { isVisible, tooltipLabel, getAIButtonProps } = renderAIButton();

      expect(isVisible).toBe(true);
      expect(getAIButtonProps().isDisabled).toBe(true);
      expect(tooltipLabel).toBe('AI functions are disabled. Go to Project settings to turn them on.');
    });

    it('is enabled when the project has opted in', () => {
      const { isVisible, tooltipLabel, getAIButtonProps } = renderAIButton();

      expect(isVisible).toBe(true);
      expect(getAIButtonProps().isDisabled).toBe(false);
      expect(tooltipLabel).toBeUndefined();
    });

    it('hides every entry point when the parent has no settings at all (CLI mode)', () => {
      availability = undefined;

      expect(renderAIButton().isVisible).toBe(false);
    });
  });
});
