/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import WindowUtils from '@/core/utils/WindowUtils';
import { CiConfigExpertAvailability } from '@/typings/globals';

import useAIButton from './useAIButton';

type Settings = { ai: { ciConfigExpert: { availability: CiConfigExpertAvailability } } } | undefined;

const withAvailability = (availability: CiConfigExpertAvailability): Settings => ({
  ai: { ciConfigExpert: { availability } },
});

let settings: Settings;

jest.mock('@/core/utils/PageProps', () => ({
  __esModule: true,
  default: {
    settings: () => settings,
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
    settings = withAvailability('enabled');
    bitriseYmlStore.setState({ tree: undefined });
    useCiConfigExpertStore.setState({ isAIDrawerOpen: false });
  });

  it('is visible in a non-modular config', () => {
    expect(renderAIButton().isVisible).toBe(true);
  });

  // The parent forwards the source to its opt-in popup tracking, so it must cross the iframe boundary.
  it('sends the source to the parent in the OPEN_CI_CONFIG_EXPERT payload', () => {
    const postMessage = jest.spyOn(WindowUtils, 'postMessageToParent').mockImplementation(() => {});

    const { getAIButtonProps } = renderHook(() =>
      useAIButton({ action: 'explain_pipeline', source: 'pipeline_drawer' }),
    ).result.current;
    getAIButtonProps().onClick();

    expect(postMessage).toHaveBeenCalledWith(
      'OPEN_CI_CONFIG_EXPERT',
      expect.objectContaining({ action: 'explain_pipeline', source: 'pipeline_drawer' }),
    );
  });

  it('is hidden in a modular config (BIVS-3735)', () => {
    initializeModularConfig({ root: ROOT, branch: 'main', commitSha: SHA });

    expect(renderAIButton().isVisible).toBe(false);
  });

  describe('availability', () => {
    it('hides every entry point when the agent is not available for the workspace', () => {
      settings = withAvailability('unavailable');

      expect(renderAIButton().isVisible).toBe(false);
    });

    // An opted-out project or workspace is indistinguishable from an opted-in one here: the parent
    // owns the difference and answers the click with the opt-in modal instead of the drawer.
    it.each(['enabled', 'disabled-by-project', 'disabled-by-workspace'] as const)(
      'offers a working entry point when the agent is available (%s)',
      (availability) => {
        settings = withAvailability(availability);

        const { isVisible, tooltipLabel, getAIButtonProps } = renderAIButton();

        expect(isVisible).toBe(true);
        expect(getAIButtonProps().isDisabled).toBe(false);
        expect(tooltipLabel).toBeUndefined();
      },
    );

    it('hides every entry point when the parent has no settings at all (CLI mode)', () => {
      settings = undefined;

      expect(renderAIButton().isVisible).toBe(false);
    });
  });
});
