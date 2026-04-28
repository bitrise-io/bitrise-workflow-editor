import { Box, ControlButton, Dot, Icon, Menu, MenuButton, MenuItem, MenuList, Text } from '@bitrise/bitkit';
import { useState } from 'react';

import SwitchBranchDialog from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';

const YmlStorageInfo = () => {
  const [isSwitchBranchDialogOpen, setIsSwitchBranchDialogOpen] = useState(false);
  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');

  const { data } = useCiConfigSettings();

  return (
    <Box
      paddingLeft="32"
      paddingRight="12"
      py="12"
      border="1px solid"
      borderColor="border/minimal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8"
    >
      <div>
        <Box display="flex" alignItems="center">
          <Text textStyle="body/md/semibold" color="text/primary">
            bitrise.yml
          </Text>
          <Dot backgroundColor="text/primary" size="4" mx="6"></Dot>
          <Text textStyle="body/md/semibold" color="text/primary">
            {data?.usesRepositoryYml ? 'in repository' : 'on bitrise.io'}
          </Text>
        </Box>
        {enableBranchSwitching && (
          <Box display="flex" alignItems="center" gap="4" mt="4">
            <Icon name="Branch" size="16" color="icon/tertiary" />
            <Text textStyle="body/sm/regular" color="text/secondary">
              main (default)
            </Text>
          </Box>
        )}
      </div>
      <Menu>
        <MenuButton as={ControlButton} iconName="MoreVertical" color="icon/secondary" size="sm" aria-label="More" />
        <MenuList>
          {enableBranchSwitching && (
            <MenuItem leftIconName="Branch" onClick={() => setIsSwitchBranchDialogOpen(true)}>
              Switch branch...
            </MenuItem>
          )}
          <MenuItem leftIconName="Download">Download YAML file</MenuItem>
          <MenuItem leftIconName="Folder">Change storage...</MenuItem>
        </MenuList>
      </Menu>
      <SwitchBranchDialog isOpen={isSwitchBranchDialogOpen} onClose={() => setIsSwitchBranchDialogOpen(false)} />
    </Box>
  );
};

export default YmlStorageInfo;
