import { useCallback } from 'react';

import {
  bitriseYmlStore,
  closeTab,
  MERGED_CONFIG_NODE_ID,
  openTab,
  recordActiveTabLocation,
  selectMergedConfig,
  selectNode,
} from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useHashLocation from '@/hooks/useHashLocation';
import { paths } from '@/routes';

/** The live router location (raw hash) — read directly, not via the lagging snapshot. */
function currentLocation(): string {
  return window.parent.location.hash;
}

/**
 * Open file tabs + the active tab, plus the tab actions. The "Merged Config"
 * tab is always conceptually first (id `mergedConfigNodeId`) and lives outside
 * `tabs`; `activeTab === mergedConfigNodeId` means it's selected.
 *
 * Switching tabs is per-tab page-aware: before leaving a tab we record its
 * current page, and on re-selecting a tab we restore the page it was last on.
 * Without this the global URL (the WFE's only source of "which page") would
 * bleed across tabs — e.g. jumping to a step-bundle definition would leave the
 * workflow tab stuck on the step-bundle page when switched back to.
 */
export function useTabs() {
  const { tabs, activeTab, isMergedStale } = useBitriseYmlStore((s) => ({
    tabs: s.openTabs,
    activeTab: s.selectedNodeId,
    isMergedStale: s.mergedYmlStale,
  }));

  const [, navigate] = useHashLocation();

  // Restore the page the target tab was last on (if any). For a file tab, no
  // stored location means never-visited — leave the current page as-is (its
  // entity selectors fall back to that file's first entity). The merged tab
  // keeps its page in `mergedTabLastLocation` (it isn't an `openTabs` entry);
  // because the merged config contains *every* entity, the previous tab's
  // selection would otherwise carry over, so a never-visited merged tab defaults
  // to a clean Workflows page (→ a default workflow is selected).
  const restoreTabLocation = useCallback(
    (nodeId: string) => {
      const state = bitriseYmlStore.getState();

      if (nodeId === MERGED_CONFIG_NODE_ID) {
        navigate(state.mergedTabLastLocation ?? paths.workflows);
        return;
      }

      const lastLocation = state.openTabs.find((tab) => tab.nodeId === nodeId)?.lastLocation;
      if (lastLocation) {
        navigate(lastLocation);
      }
    },
    [navigate],
  );

  const selectTab = useCallback(
    (nodeId: string) => {
      recordActiveTabLocation(currentLocation());
      selectNode(nodeId);
      restoreTabLocation(nodeId);
    },
    [restoreTabLocation],
  );

  const openFile = useCallback(
    (nodeId: string) => {
      recordActiveTabLocation(currentLocation());
      openTab(nodeId);
      restoreTabLocation(nodeId);
    },
    [restoreTabLocation],
  );

  const selectMerged = useCallback(() => {
    recordActiveTabLocation(currentLocation());
    selectMergedConfig();
    restoreTabLocation(MERGED_CONFIG_NODE_ID);
  }, [restoreTabLocation]);

  // Closing the active tab makes the store rebind to a neighbor; restore that
  // neighbor's last page too. Closing an inactive tab leaves the active tab
  // unchanged — don't navigate (its stored location may be stale).
  const closeTabAndRestore = useCallback(
    (nodeId: string) => {
      const before = bitriseYmlStore.getState().selectedNodeId;
      closeTab(nodeId);
      const after = bitriseYmlStore.getState().selectedNodeId;
      if (after && after !== before) {
        restoreTabLocation(after);
      }
    },
    [restoreTabLocation],
  );

  return {
    tabs,
    activeTab,
    isMergedStale,
    mergedConfigNodeId: MERGED_CONFIG_NODE_ID,
    selectTab,
    openFile,
    closeTab: closeTabAndRestore,
    selectMergedConfig: selectMerged,
  };
}
