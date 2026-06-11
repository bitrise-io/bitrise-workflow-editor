/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import BranchesApi from '@/core/api/BranchesApi';
import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';

import usePushBranch from './usePushBranch';

jest.mock('@bitrise/bitkit', () => ({
  useToast: () => jest.fn(),
}));

jest.mock('@/core/analytics/ConfigManagementAnalytics', () => ({
  trackOpenPrAttempted: jest.fn(),
  trackPushConfigChangesAttempted: jest.fn(),
  trackPushConfigChangesFailed: jest.fn(),
  trackPushConfigChangesSucceeded: jest.fn(),
}));

// React.createElement instead of JSX: the swc jest transform uses the classic JSX
// runtime, which would require an otherwise-unused React import that tsc rejects.
const wrapper = ({ children }: { children: ReactNode }) =>
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('usePushBranch', () => {
  beforeEach(() => {
    jest.spyOn(PageProps, 'appSlug').mockReturnValue('app-1');
    initializeBitriseYmlDocument({
      ymlString: yaml`format_version: "13"`,
      version: '1',
      branch: 'main',
      commitSha: 'old-sha',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pushes the current config and reloads the pushed branch before calling onSuccess', async () => {
    const pushSpy = jest.spyOn(BranchesApi, 'pushBranch').mockResolvedValue(undefined as never);
    const getCiConfigSpy = jest.spyOn(BitriseYmlApi, 'getCiConfig').mockResolvedValue({
      ymlString: yaml`format_version: "17"`,
      version: '2',
      branch: 'feature',
      commitSha: 'new-sha',
    });

    // The contract introduced here: onSuccess fires only after the store already
    // reflects the pushed state (the modular path later in the stack relies on it).
    let storeAtOnSuccess: { version?: string; configCommitSha?: string } = {};
    const onSuccess = jest.fn(() => {
      const { version, configCommitSha } = bitriseYmlStore.getState();
      storeAtOnSuccess = { version, configCommitSha };
    });

    const { result } = renderHook(() => usePushBranch({ onSuccess }), { wrapper });

    act(() => {
      result.current.pushBranch({ branch: 'feature', message: 'push it' });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(pushSpy).toHaveBeenCalledWith({
      appSlug: 'app-1',
      branch: 'feature',
      sourceBranch: 'main',
      commitSha: 'old-sha',
      bitriseYml: expect.stringContaining('format_version'),
      message: 'push it',
    });
    expect(getCiConfigSpy).toHaveBeenCalledWith({ projectSlug: 'app-1', branch: 'feature' });
    expect(storeAtOnSuccess).toEqual({ version: '2', configCommitSha: 'new-sha' });
  });

  it('does not push and does not call onSuccess when the config is not loaded', async () => {
    initializeBitriseYmlDocument({ ymlString: yaml`format_version: "13"`, version: '1' });
    const pushSpy = jest.spyOn(BranchesApi, 'pushBranch');
    const onSuccess = jest.fn();

    const { result } = renderHook(() => usePushBranch({ onSuccess }), { wrapper });

    act(() => {
      result.current.pushBranch({ branch: 'feature', message: 'push it' });
    });

    await waitFor(() => expect(result.current.isPushPending).toBe(false));

    expect(pushSpy).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
