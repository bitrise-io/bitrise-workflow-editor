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
 * Re-merges the live tree whenever the Merged tab is active and stale. Mounted
 * once in `MainLayout` so the merge is available on the entity pages too.
 */
export default function useMergedConfigSync() {
  const selectedNodeId = useStore(bitriseYmlStore, (s) => s.selectedNodeId);
  const isStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  // Ref (not state) so the fetch doesn't re-enter and we avoid a setState in the effect.
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
