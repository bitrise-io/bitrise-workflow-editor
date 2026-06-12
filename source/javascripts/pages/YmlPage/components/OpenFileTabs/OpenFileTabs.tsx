import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

import FileTab from './FileTab';

/**
 * The editor-area tab strip for the modular config. "Merged Config" tab first, then open
 * file tabs, then a frameless "+" to open/create module files.
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
          css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconGroup} flexShrink={0}>
            Merged Config
          </BitkitTabs.Trigger>
          {tabs.map((tab) => (
            <FileTab key={tab.nodeId} nodeId={tab.nodeId} />
          ))}
          <Box
            display="flex"
            padding="4px"
            alignItems="center"
            gap="4px"
            borderRadius="4px"
            background="#FFF"
            backgroundBlendMode="multiply"
            alignSelf="center"
          >
            <FileTreeViewer />
          </Box>
        </BitkitTabs.List>
      </Box>
    </BitkitTabs.Root>
  );
};

export default OpenFileTabs;
