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
      return;
    }

    isFetchingRef.current = true;

    // Reads live store state each pass (not closed-over deps), so an edit that lands
    // while a fetch is in flight — which re-sets mergedYmlStale to true without
    // toggling it, so the effect never re-runs — is still picked up: the in-flight
    // result is discarded and a fresh merge runs for the post-edit tree. This also
    // covers the tab-switch race (merged→file→edit→merged before the first fetch
    // resolves), where the persistent ref would otherwise block any re-trigger.
    const runMerge = () => {
      const state = bitriseYmlStore.getState();
      if (state.selectedNodeId !== MERGED_CONFIG_NODE_ID || !state.mergedYmlStale) {
        isFetchingRef.current = false;
        return;
      }

      const tree = getModularConfigTree();
      if (!tree) {
        isFetchingRef.current = false;
        return;
      }

      const requestedTree = JSON.stringify(tree);
      BitriseYmlApi.getMergedConfig({ projectSlug: PageProps.appSlug(), tree, branch: state.configBranch })
        .then((result) => {
          // Apply only if the tree we merged is still current; otherwise an edit landed
          // mid-flight and the result is stale — re-merge the fresh tree instead.
          if (JSON.stringify(getModularConfigTree()) === requestedTree) {
            setMergedConfig(result.mergedYml);
            isFetchingRef.current = false;
          } else {
            runMerge();
          }
        })
        .catch(() => {
          // Leave it stale; a later edit or tab re-activation retries. Don't loop on a failing merge.
          isFetchingRef.current = false;
        });
    };

    runMerge();
  }, [isMerged, isStale]);
}
