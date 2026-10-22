import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { useRef, useState } from 'react';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { trackWorkflowEditorFileExplorerOpened } from '@/core/analytics/ConfigManagementAnalytics';
import { FileTabInfo, useFileTabs } from '@/hooks/useFileTabs';

import DiscardFileTabDialog from './DiscardFileTabDialog';

const OpenFileTabs = () => {
  const { fileTabs, activeTab, mergedConfigNodeId, selectTab, selectMergedConfig, closeTab, discardFile } =
    useFileTabs();
  const [discardNodeId, setDiscardNodeId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const discardTab = fileTabs.find((tab) => tab.nodeId === discardNodeId);

  // A purple dot marks an unsaved file; a saved (unchanged) file has no dot.
  const tabStatusColor = (tab: FileTabInfo) => (tab.isDirty ? 'purple' : undefined);

  // Closing a tab with unsaved edits prompts first; a clean tab closes immediately.
  const handleClose = (tab: FileTabInfo) => {
    if (tab.isDirty) {
      setDiscardNodeId(tab.nodeId);
    } else {
      closeTab(tab.nodeId);
    }
  };

  return (
    <BitkitTabs.Root
      variant="canvas"
      value={activeTab ?? mergedConfigNodeId}
      onValueChange={({ value }) => {
        if (value === mergedConfigNodeId) {
          selectMergedConfig();
        } else {
          selectTab(value);
        }
      }}
    >
      <BitkitTabs.List
        // The strip shares the resting tabs gray, so only the open tab stands out (white). The outer edges
        // of the first and the last tab need no border of their own.
        background="background/secondary"
        // Covers the header's bottom border where the tabs are, so the strip has no line on top. The
        // border stays over the sidebar.
        position="relative"
        zIndex="1"
        marginBlockStart="-1px"
        css={{
          '& [data-part=trigger]:first-of-type': { borderInlineStartWidth: 0 },
          '& [data-part=trigger]:not(:has(~ [data-part=trigger]))': { borderInlineEndWidth: 0 },
        }}
      >
        <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconGroup}>
          Merged config
        </BitkitTabs.Trigger>
        {fileTabs.map((tab) => (
          <BitkitTabs.Trigger
            key={tab.nodeId}
            value={tab.nodeId}
            onClose={() => handleClose(tab)}
            statusColor={tabStatusColor(tab)}
            title={tab.editable ? undefined : `Read-only${tab.refLabel ? ` — included from ${tab.refLabel}` : ''}`}
          >
            {tab.name}
          </BitkitTabs.Trigger>
        ))}
        <BitkitTabs.AddButton
          ref={addButtonRef}
          label="Open module"
          onClick={() => {
            // Keep the analytics side effect out of the state updater (React may call updaters more
            // than once, e.g. in StrictMode) — fire once here, only when opening.
            if (!pickerOpen) {
              trackWorkflowEditorFileExplorerOpened();
            }
            setPickerOpen((open) => !open);
          }}
        />
      </BitkitTabs.List>

      <FileTreeViewer open={pickerOpen} onOpenChange={setPickerOpen} getAnchor={() => addButtonRef.current} />

      <DiscardFileTabDialog
        isOpen={Boolean(discardTab)}
        fileName={discardTab?.name ?? ''}
        onKeepEditing={() => setDiscardNodeId(null)}
        onDiscard={() => {
          if (discardNodeId) {
            discardFile(discardNodeId);
          }
          setDiscardNodeId(null);
        }}
      />
    </BitkitTabs.Root>
  );
};

export default OpenFileTabs;
