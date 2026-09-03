/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import ConfigLoadTracker from '@/core/utils/ConfigLoadTracker';

import InitialDataLoader from './InitialDataLoader';

// CLI mode takes the tree path; a root with no includes resolves to the single-file flow.
const TREE = {
  root: { contents: 'format_version: "13"', commitSha: 'abc123', includes: [] },
  branch: 'master',
};

jest.mock('@/core/stores/BitriseYmlStore', () => ({
  initializeBitriseYmlDocument: jest.fn(),
  initializeModularConfig: jest.fn(),
}));

// The query is already resolved from cache on a remount — that is what made the bug bite.
jest.mock('@/hooks/useCiConfig', () => ({
  useGetCiConfig: () => ({ data: undefined, error: undefined, refetch: jest.fn() }),
}));
jest.mock('@/hooks/useCiConfigTree', () => ({
  useGetCiConfigTree: () => ({ data: TREE, error: undefined, refetch: jest.fn() }),
}));
jest.mock('@/hooks/useCiConfigSettings', () => ({
  useCiConfigSettings: () => ({ data: { usesRepositoryYml: false }, isPending: false }),
}));

jest.mock('@/hooks/useYmlHasChanges', () => ({ __esModule: true, default: () => false }));
jest.mock('@/hooks/useYmlLanguageServices', () => ({ __esModule: true, default: () => undefined }));
jest.mock('@/hooks/useCloseAIDrawer', () => ({ __esModule: true, default: () => undefined }));
jest.mock('@/hooks/useFeatureFlag', () => ({ __esModule: true, default: () => false }));
jest.mock('@/hooks/useSearchParams', () => ({ __esModule: true, default: () => [{}, jest.fn()] }));
jest.mock('@/core/utils/RuntimeUtils', () => ({
  __esModule: true,
  default: { isWebsiteMode: () => false, isProduction: () => false, isLocalMode: () => false },
}));
jest.mock('@/core/utils/PageProps', () => ({ __esModule: true, default: { appSlug: () => 'slug' } }));
jest.mock('@/core/analytics/ConfigManagementAnalytics', () => ({ trackConfigBranchLoaded: jest.fn() }));
jest.mock('@/routes', () => ({ preloadRoutes: jest.fn() }));
// Same shape as usePushBranch.spec: only useToast is reached, the v1 error branch never renders.
jest.mock('@bitrise/bitkit', () => ({
  useToast: () => jest.fn(),
}));

describe('InitialDataLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ConfigLoadTracker.reset();
  });

  it('initialises the store on first mount', () => {
    render(<InitialDataLoader>content</InitialDataLoader>);

    expect(initializeBitriseYmlDocument).toHaveBeenCalledTimes(1);
  });

  // The regression test for the data-loss bug: the top-level ErrorBoundary's PassThroughFallback
  // remounts this subtree on any render error. Re-initialising here overwrites both ymlDocument and
  // savedYmlDocument from the server, silently discarding unsaved edits. Fails on the ref-based
  // implementation, which read a remount as a first load.
  it('does not re-initialise the store when it remounts', () => {
    const view = render(<InitialDataLoader>content</InitialDataLoader>);
    expect(initializeBitriseYmlDocument).toHaveBeenCalledTimes(1);

    view.unmount();
    render(<InitialDataLoader>content</InitialDataLoader>);

    expect(initializeBitriseYmlDocument).toHaveBeenCalledTimes(1);
  });

  it('initialises again once a different branch is requested', () => {
    render(<InitialDataLoader>content</InitialDataLoader>).unmount();
    expect(initializeBitriseYmlDocument).toHaveBeenCalledTimes(1);

    // Same shape as a branch switch: the tracker keys on the requested branch, not on the mount.
    ConfigLoadTracker.markLoaded('other-branch');
    render(<InitialDataLoader>content</InitialDataLoader>);

    expect(initializeBitriseYmlDocument).toHaveBeenCalledTimes(2);
  });
});
