import { useCallback, useEffect, useRef } from 'react';

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

import useModularConfig from './useModularConfig';

const MERGE_DEBOUNCE_MS = 300;

export default function useMergeConfig() {
  const isModular = useModularConfig((s) => s.isModular);
  const files = useModularConfig((s) => s.files);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  const triggerMerge = useCallback(async () => {
    const tree = getOriginalTree();
    if (!tree) return;

    const { files: currentFiles } = modularConfigStore.getState();
    const updatedTree = buildTreeFromFiles(currentFiles, tree);
    const projectSlug = PageProps.appSlug();

    // Abort any in-flight merge
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMerging(true);

    try {
      const mergedYml = await ModularConfigApi.mergeConfig({
        projectSlug,
        tree: updatedTree,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        updateMergedResult(mergedYml);

        // If on merged tab, update BitriseYmlStore to reflect new merge
        const { activeFileIndex: currentIndex } = modularConfigStore.getState();
        if (currentIndex === -1) {
          initializeBitriseYmlDocument({ ymlString: mergedYml, version: '' });
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setMergeError(error instanceof Error ? error.message : String(error));
      }
    }
  }, []);

  useEffect(() => {
    if (!isModular) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(triggerMerge, MERGE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isModular, files, triggerMerge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
}
