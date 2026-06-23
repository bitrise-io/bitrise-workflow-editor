import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { useRef, useState } from 'react';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { FileTabInfo, useFileTabs } from '@/hooks/useFileTabs';

import DiscardFileTabDialog from './DiscardFileTabDialog';

const OpenFileTabs = () => {
  const { fileTabs, activeTab, mergedConfigNodeId, selectTab, selectMergedConfig, closeTab, discardFile } =
    useFileTabs();
  const [discardNodeId, setDiscardNodeId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const discardTab = fileTabs.find((tab) => tab.nodeId === discardNodeId);

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
      <BitkitTabs.List background="background/primary">
        <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconGroup}>
          Merged Config
        </BitkitTabs.Trigger>
        {fileTabs.map((tab) => (
          <BitkitTabs.Trigger
            key={tab.nodeId}
            value={tab.nodeId}
            onClose={() => handleClose(tab)}
            statusColor={tab.isDirty ? 'purple' : undefined}
            title={tab.editable ? undefined : `Read-only${tab.refLabel ? ` — included from ${tab.refLabel}` : ''}`}
          >
            {tab.name}
          </BitkitTabs.Trigger>
        ))}
        <BitkitTabs.AddButton ref={addButtonRef} label="Open module" onClick={() => setPickerOpen((open) => !open)} />
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
