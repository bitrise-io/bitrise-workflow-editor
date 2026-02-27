import { useEffect, useRef } from 'react';

import ModularConfigApi from '@/core/api/ModularConfigApi';
import {
  buildTreeFromFiles,
  getOriginalTree,
  modularConfigStore,
  setMergeError,
  setMerging,
  updateMergedResult,
} from '@/core/stores/ModularConfigStore';
import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';

const MERGE_DEBOUNCE_MS = 300;

async function doMerge(abortController: AbortController) {
  const tree = getOriginalTree();
  if (!tree) return;

  const { files: currentFiles } = modularConfigStore.getState();
  const updatedTree = buildTreeFromFiles(currentFiles, tree);
  const projectSlug = PageProps.appSlug();

  setMerging(true);

  try {
    const mergedYml = await ModularConfigApi.mergeConfig({
      projectSlug,
      tree: updatedTree,
      signal: abortController.signal,
    });

    if (!abortController.signal.aborted) {
      updateMergedResult(mergedYml);

      const { activeFileIndex: currentIndex } = modularConfigStore.getState();
      if (currentIndex === -1) {
        initializeBitriseYmlDocument({ ymlString: mergedYml, version: '' });
      }
    }
  } catch (error) {
    if (!abortController.signal.aborted) {
      setMergeError(error instanceof Error ? error.message : String(error));
    }
  }
}

export default function useMergeConfig() {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    const unsub = modularConfigStore.subscribe(
      (state) => state.files.map((f) => f.currentContents),
      () => {
        const { isModular } = modularConfigStore.getState();
        if (!isModular) return;

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        debounceRef.current = setTimeout(() => doMerge(controller), MERGE_DEBOUNCE_MS);
      },
      {
        equalityFn: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
      },
    );

    return () => {
      unsub();
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
}
