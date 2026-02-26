import { Box, Tab, TabList, Tabs, Tooltip } from '@bitrise/bitkit';
import { useMemo } from 'react';

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { setActiveFileIndex } from '@/core/stores/ModularConfigStore';
import useModularConfig from '@/hooks/useModularConfig';

function shortenPath(path: string): string {
  // Remove repo/branch suffixes from configmerge-style keys like "file.yml@branch:main"
  const atIndex = path.indexOf('@');
  if (atIndex > 0) {
    return path.substring(0, atIndex);
  }
  return path;
}

const FileTabsBar = () => {
  const { isModular, activeFileIndex, files, isMerging } = useModularConfig();

  const tabIndex = useMemo(() => {
    // Tab 0 = merged, Tab 1..N = individual files
    return activeFileIndex + 1;
  }, [activeFileIndex]);

  if (!isModular || files.length === 0) {
    return null;
  }

  const handleTabChange = (index: number) => {
    const fileIndex = index - 1; // -1 for merged tab
    const version = bitriseYmlStore.getState().version;
    setActiveFileIndex(fileIndex, version);
  };

  return (
    <Box
      borderBottom="1px solid"
      borderColor="separator.primary"
      backgroundColor="background/primary"
      overflowX="auto"
    >
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TabList>
          <Tab leftIconName="Overview">
            Merged{isMerging ? ' ...' : ''}
          </Tab>
          {files.map((file) => {
            const hasChanges = file.currentContents !== file.savedContents;
            const shortPath = shortenPath(file.path);

            return (
              <Tooltip key={file.path} label={file.path} placement="bottom">
                <Tab leftIconName={file.isReadOnly ? 'Lock' : undefined}>
                  {shortPath}
                  {hasChanges && (
                    <Box
                      as="span"
                      ml="6"
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      backgroundColor="text/secondary"
                      display="inline-block"
                      flexShrink={0}
                    />
                  )}
                </Tab>
              </Tooltip>
            );
          })}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default FileTabsBar;
