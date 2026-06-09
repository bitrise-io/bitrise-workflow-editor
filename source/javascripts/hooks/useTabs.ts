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
 * Open file tabs + the active tab, plus the tab actions. The Merged Config tab
 * lives outside `tabs`; `activeTab === mergedConfigNodeId` means it's selected.
 * Tab switching is per-tab page-aware: each tab's current page is recorded on
 * leave and restored on re-select, so the global URL doesn't bleed across tabs.
 */
export function useTabs() {
  const { tabs, activeTab, isMergedStale } = useBitriseYmlStore((s) => ({
    tabs: s.openTabs,
    activeTab: s.selectedNodeId,
    isMergedStale: s.mergedYmlStale,
  }));

  const [, navigate] = useHashLocation();

  // Restore the page the target tab was last on. A never-visited file tab keeps
  // the current page; a never-visited merged tab defaults to Workflows (it holds
  // every entity, so the previous tab's selection must not carry over).
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

  // Closing the active tab rebinds the store to a neighbor; restore its last
  // page. Closing an inactive tab leaves the active tab unchanged — don't navigate.
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
