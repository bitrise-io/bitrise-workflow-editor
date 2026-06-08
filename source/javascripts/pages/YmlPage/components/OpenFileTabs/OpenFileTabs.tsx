import { BitkitTabs, IconCode } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

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
        // 48px total, border-box (the 1px separator is included) — matches the
        // ConfigSettingsBar so the two bars line up.
        h="48px"
        backgroundColor="background/primary"
        borderBottomWidth="1px"
        borderBottomColor="border/minimal"
      >
        {/* Tab geometry, carefully balanced:
            - A bitkit `line` trigger is 47px tall and uses `position: relative;
              bottom: -1px` to nudge itself down 1px so its 2px underline overlaps
              the separator. `align-items: flex-start` stops the List from
              stretching the trigger (stretch + the nudge = 1px overflow past the
              bar — the original bug).
            - The List is a full 48px so the nudged trigger (y=1→48) fits entirely
              inside it: nothing clips, so the whole 2px underline is visible.
            - `mb="-1px"` pulls that 48px List back into the outer Box's 47px
              content area (48px outer − 1px border), so the List's bottom 1px
              overlaps the divider instead of overflowing it.
            - overflowY is explicit because `overflow-x: auto` alone makes the
              computed `overflow-y` resolve to `auto` too (CSS spec); with the
              trigger now fully contained there's nothing to scroll, so no stray
              vertical scrollbar. */}
        <BitkitTabs.List
          flex="1"
          h="48px"
          mb="-1px"
          alignItems="flex-start"
          overflowX="auto"
          overflowY="hidden"
          border="none"
        >
          <BitkitTabs.Trigger value={mergedConfigNodeId} icon={IconCode}>
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
