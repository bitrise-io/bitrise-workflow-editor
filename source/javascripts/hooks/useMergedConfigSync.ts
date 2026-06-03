import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import {
  bitriseYmlStore,
  getModularConfigTree,
  MERGED_CONFIG_NODE_ID,
  setMergedConfig,
} from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';

/**
 * Keeps the Merged-config view fresh, globally. When the Merged tab is active
 * and stale — its first open after a failed bootstrap merge, or after any file
 * edit — this merges the live tree and stores the result; `setMergedConfig`
 * then rebinds the active document so every entity resolves locally (no
 * cross-file ghosts on the merged view).
 *
 * Mounted once in `MainLayout` (above all pages) rather than in the YAML source
 * page, so the merge is available on the entity pages too — that's where the
 * cross-file cards live.
 */
export default function useMergedConfigSync() {
  const selectedNodeId = useStore(bitriseYmlStore, (s) => s.selectedNodeId);
  const isStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  // Ref guard (not state) so the fetch doesn't re-enter, and so we don't run a
  // synchronous setState inside the effect.
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!isMerged || !isStale || isFetchingRef.current) {
      return undefined;
    }

    const tree = getModularConfigTree();
    if (!tree) {
      return undefined;
    }

    const branch = bitriseYmlStore.getState().configBranch;

    let cancelled = false;
    isFetchingRef.current = true;
    BitriseYmlApi.getMergedConfig({ projectSlug: PageProps.appSlug(), tree, branch })
      .then((result) => {
        if (!cancelled) {
          setMergedConfig(result.mergedYml);
        }
      })
      .finally(() => {
        isFetchingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [isMerged, isStale]);
}
