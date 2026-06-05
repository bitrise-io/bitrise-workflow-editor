import { BitkitTabs, IconCode } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

import CreateFileButton from './CreateFileButton';
import FileTab from './FileTab';
import TabDiffButton from './TabDiffButton';

/**
 * The editor-area tab strip for the modular config, built on `BitkitTabs`. The
 * "Merged Config" tab is always first; open file tabs follow (each with its own
 * unsaved dot + close button via `BitkitTabs.Trigger`). The diff / create /
 * "Open module" buttons sit at the right end.
 */
const OpenFileTabs = () => {
  const { tabs, activeTab, mergedConfigNodeId, selectTab, selectMergedConfig } = useTabs();

  return (
    <BitkitTabs.Root
      value={activeTab ?? mergedConfigNodeId}
      onValueChange={({ value }) => {
        if (value === mergedConfigNodeId) {
          selectMergedConfig();
        } else {
          selectTab(value);
        }
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        flexShrink={0}
        minH="65"
        backgroundColor="background/primary"
        borderBottomWidth="1px"
        borderBottomColor="border/minimal"
      >
        {/* The triggers + their selected indicator are 48px tall; pin the List
            to that so the indicator isn't clipped. overflowY is explicit because
            `overflow-x: auto` alone makes the computed `overflow-y` resolve to
            `auto` too (CSS spec) — a sub-pixel overflow would otherwise show a
            stray vertical scrollbar. */}
        <BitkitTabs.List flex="1" minH="48px" overflowX="auto" overflowY="hidden" border="none">
          <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconCode}>
            Merged Config
          </BitkitTabs.Trigger>
          {tabs.map((tab) => (
            <FileTab key={tab.nodeId} nodeId={tab.nodeId} />
          ))}
        </BitkitTabs.List>

        <Box flexShrink={0} display="flex" alignItems="center" gap="8" paddingInline="12">
          <TabDiffButton />
          <CreateFileButton />
          <FileTreeViewer />
        </Box>
      </Box>
    </BitkitTabs.Root>
  );
};

export default OpenFileTabs;
