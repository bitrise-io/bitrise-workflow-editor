import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

import FileTab from './FileTab';
import TabDiffButton from './TabDiffButton';

/**
 * The editor-area tab strip for the modular config. "Merged Config" tab first, then open
 * file tabs; the diff / create / "Open module" buttons sit at the right end.
 */
const OpenFileTabs = () => {
  const { tabs, activeTab, mergedConfigNodeId, selectTab, selectMergedConfig } = useTabs();

  return (
    <BitkitTabs.Root
      variant="line"
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
        // 48px border-box (incl. the 1px separator) to line up with the ConfigSettingsBar.
        h="48px"
        backgroundColor="background/primary"
        borderBottomWidth="1px"
        borderBottomColor="border/minimal"
      >
        {/* Tab geometry gotchas: `flex-start` stops the List stretching the nudged-down
            trigger (stretch + nudge overflowed the bar). `mb="-1px"` overlaps the 48px
            List's bottom onto the divider. Explicit `overflowY` because `overflow-x: auto`
            makes computed `overflow-y` resolve to `auto` too (CSS spec), causing a stray scrollbar. */}
        <BitkitTabs.List
          flex="1"
          h="48px"
          mb="-1px"
          alignItems="flex-start"
          overflowX="auto"
          overflowY="hidden"
          border="none"
        >
          <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconGroup}>
            Merged Config
          </BitkitTabs.Trigger>
          {tabs.map((tab) => (
            <FileTab key={tab.nodeId} nodeId={tab.nodeId} />
          ))}
        </BitkitTabs.List>

        <Box flexShrink={0} display="flex" alignItems="center" gap="8" paddingInline="12">
          <TabDiffButton />
          <FileTreeViewer />
        </Box>
      </Box>
    </BitkitTabs.Root>
  );
};

export default OpenFileTabs;
