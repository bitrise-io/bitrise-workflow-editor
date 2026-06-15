/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { TreeNode } from '@/core/models/Tree';
import {
  bitriseYmlStore,
  initializeModularConfig,
  selectMergedConfig,
  updateFileDocument,
} from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import YmlUtils from '@/core/utils/YmlUtils';

import useMergedConfigSync from './useMergedConfigSync';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function buildRoot(): TreeNode {
  return {
    nodeId: 'root',
    path: 'bitrise.yml',
    contents: 'format_version: "13"\n',
    source: null,
    commitSha: 'sha',
    editable: true,
    includes: [
      {
        nodeId: 'child-a',
        path: 'child-a.yml',
        contents: 'workflows:\n  wf-a: {}\n',
        source: null,
        commitSha: 'sha',
        editable: true,
        includes: [],
      },
    ],
  };
}

const entityIndex = { workflows: { 'wf-a': [{ nodeId: 'child-a' }] }, pipelines: {}, stepBundles: {} };

describe('useMergedConfigSync', () => {
  beforeEach(() => {
    jest.spyOn(PageProps, 'appSlug').mockReturnValue('app-1');
    initializeModularConfig({ root: buildRoot(), entityIndex, branch: 'main', commitSha: 'abc' });
    selectMergedConfig();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('merges the live tree once and applies the result when the merged tab is active and stale', async () => {
    const merge = jest.spyOn(BitriseYmlApi, 'getMergedConfig').mockResolvedValue({ mergedYml: 'merged: ok' });

    renderHook(() => useMergedConfigSync());

    await waitFor(() => expect(bitriseYmlStore.getState().mergedYml).toBe('merged: ok'));
    expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);
    expect(merge).toHaveBeenCalledTimes(1);
  });

  it('discards an in-flight result and re-merges the fresh tree when an edit lands mid-fetch', async () => {
    const first = deferred<{ mergedYml: string }>();
    const second = deferred<{ mergedYml: string }>();
    const merge = jest
      .spyOn(BitriseYmlApi, 'getMergedConfig')
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    renderHook(() => useMergedConfigSync());

    // First fetch is in flight for the pre-edit tree.
    await waitFor(() => expect(merge).toHaveBeenCalledTimes(1));

    // An edit lands while the merge is in flight (re-sets staleness without toggling it).
    act(() => {
      updateFileDocument('child-a', ({ doc }) => {
        YmlUtils.setIn(doc, ['workflows', 'wf-b'], {});
        return doc;
      });
    });

    // The in-flight result reflects the pre-edit tree — it must be discarded, not applied.
    await act(async () => {
      first.resolve({ mergedYml: 'merged: STALE' });
    });
    expect(bitriseYmlStore.getState().mergedYml).not.toBe('merged: STALE');
    expect(bitriseYmlStore.getState().mergedYmlStale).toBe(true);

    // A fresh merge runs for the post-edit tree.
    await waitFor(() => expect(merge).toHaveBeenCalledTimes(2));
    const secondTree = merge.mock.calls[1][0].tree;
    expect(JSON.stringify(secondTree)).toContain('wf-b');

    await act(async () => {
      second.resolve({ mergedYml: 'merged: FRESH' });
    });
    await waitFor(() => expect(bitriseYmlStore.getState().mergedYml).toBe('merged: FRESH'));
    expect(bitriseYmlStore.getState().mergedYmlStale).toBe(false);
  });
});
