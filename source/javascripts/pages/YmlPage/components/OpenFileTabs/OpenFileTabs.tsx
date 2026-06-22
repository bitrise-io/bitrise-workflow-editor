import { BitkitTabs, IconGroup } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

import FileTab from './FileTab';

const OpenFileTabs = () => {
  const { tabs, activeTab, mergedConfigNodeId, selectTab, selectMergedConfig } = useTabs();

  return (
    <BitkitTabs.Root
      variant="canvas"
      value={activeTab ?? mergedConfigNodeId}
      onValueChange={({ value }: { value: string }) => {
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
        height="48"
        backgroundColor="background/primary"
        borderBottomWidth="1px"
        borderBottomColor="border/minimal"
      >
        <BitkitTabs.List
          flex="1"
          height="48"
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
            padding="4"
            alignItems="center"
            gap="4"
            borderRadius="4"
            background="background/primary"
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
