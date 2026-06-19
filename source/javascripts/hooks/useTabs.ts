import { useCallback } from 'react';

import {
  bitriseYmlStore,
  closeTab,
  discardFile,
  getTabLastLocation,
  isYmlPageLocation,
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
 * Tab switching is per-tab page-aware in visual mode: each tab's current visual
 * page is recorded on leave and restored on re-select, so the global URL doesn't
 * bleed across tabs. YAML mode is global instead — switching tabs while on the
 * YAML page stays in code view.
 */
export function useTabs() {
  const { tabs, activeTab, isMergedStale } = useBitriseYmlStore((s) => ({
    tabs: s.openTabs,
    activeTab: s.selectedNodeId,
    isMergedStale: s.mergedYmlStale,
  }));

  const [, navigate] = useHashLocation();

  // Restore the visual page the target tab was last on. In YAML mode this is a
  // no-op: code view is a global mode, so switching tabs must stay on the YAML
  // page instead of jumping to a visual page. In visual mode, a never-visited
  // file tab keeps the current page; a never-visited merged tab defaults to
  // Workflows (it holds every entity, so the previous tab's selection must not
  // carry over).
  const restoreTabLocation = useCallback(
    (nodeId: string) => {
      if (isYmlPageLocation(currentLocation())) {
        return;
      }

      const lastLocation = getTabLastLocation(nodeId);

      if (nodeId === MERGED_CONFIG_NODE_ID) {
        navigate(lastLocation ?? paths.workflows);
        return;
      }

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
      // Explicit "Open module" gesture → pin a permanent tab, not a preview that the next open replaces.
      openTab(nodeId, { preview: false });
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

  // Discard the file's unsaved edits and close its tab; rebinds + restores like closeTab.
  const discardFileAndRestore = useCallback(
    (nodeId: string) => {
      const before = bitriseYmlStore.getState().selectedNodeId;
      discardFile(nodeId);
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
    discardFile: discardFileAndRestore,
    selectMergedConfig: selectMerged,
  };
}
