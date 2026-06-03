import { IconCode } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { useTabs } from '@/hooks/useTabs';

import FileTab from './FileTab';

/**
 * The editor-area tab strip for the modular config. The "Merged Config" tab is
 * always first and visually separated; open file tabs follow with preview /
 * dirty / read-only affordances; the "Open module" tree popover sits at the
 * right end.
 */
const OpenFileTabs = () => {
  const { tabs, activeTab, mergedConfigNodeId, selectMergedConfig } = useTabs();
  const isMergedActive = activeTab === mergedConfigNodeId;

  return (
    <Box
      display="flex"
      alignItems="center"
      flexShrink={0}
      minH="65"
      backgroundColor="background/primary"
      borderBottomWidth="1px"
      borderBottomColor="border/minimal"
    >
      <Box display="flex" alignItems="center" flex="1" overflowX="auto">
        {/* Merged Config tab — always present, separated from file tabs. */}
        <Box
          display="flex"
          alignItems="center"
          gap="6"
          flexShrink={0}
          paddingInline="12"
          height="40px"
          cursor="pointer"
          borderRightWidth="1px"
          borderRightColor="border/regular"
          borderBottomWidth="2px"
          borderBottomColor={isMergedActive ? 'border/selected' : 'transparent'}
          backgroundColor={isMergedActive ? 'background/selected' : 'transparent'}
          _hover={{ backgroundColor: isMergedActive ? 'background/selected' : 'background/hover' }}
          onClick={selectMergedConfig}
          role="tab"
          aria-selected={isMergedActive}
        >
          <IconCode size="16" />
          <Text textStyle="body/md/semibold" color="text/primary" whiteSpace="nowrap">
            Merged Config
          </Text>
        </Box>

        {tabs.map((tab) => (
          <FileTab key={tab.nodeId} nodeId={tab.nodeId} isPreview={tab.isPreview} isActive={tab.nodeId === activeTab} />
        ))}
      </Box>

      <Box flexShrink={0} paddingInline="12">
        <FileTreeViewer />
      </Box>
    </Box>
  );
};

export default OpenFileTabs;
