import {
  Box,
  ControlButton,
  Dot,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonBox,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';

import SwitchBranchDialog from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import ConfigurationYmlSourceDialog from '@/pages/YmlPage/components/ConfigurationYmlSourceDialog';

const YmlConfigInfo = () => {
  const {
    isOpen: isSwitchBranchDialogOpen,
    onClose: onSwitchBranchDialogClose,
    onOpen: onSwitchBranchDialogOpen,
  } = useDisclosure();
  const { isOpen: isStorageDialogOpen, onClose: onStorageDialogClose, onOpen: onStorageDialogOpen } = useDisclosure();
  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');

  const { data, isPending } = useCiConfigSettings();

  const handleDownload = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'yml_editor_header',
    });
    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  const handleStorageChange = () => {
    segmentTrack('Change Configuration Yml Source Button Clicked', {
      yml_source: data?.usesRepositoryYml ? 'git' : 'bitrise',
    });
    onStorageDialogOpen();
  };

  return (
    <Box
      paddingLeft="32"
      paddingRight="12"
      py="12"
      mb="24"
      borderBottom="1px solid"
      borderColor="border/minimal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8"
    >
      <div>
        <Box display="flex" alignItems="center">
          <Text as="h5" textStyle="body/md/semibold" color="text/primary">
            bitrise.yml
          </Text>
          <Dot backgroundColor="text/primary" size="4" mx="6"></Dot>
          {isPending ? (
            <Skeleton>
              <SkeletonBox height="20px" width="100px" />
            </Skeleton>
          ) : (
            <Text as="h5" textStyle="body/md/semibold" color="text/primary">
              {data?.usesRepositoryYml ? 'in repository' : 'on bitrise.io'}
            </Text>
          )}
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
            <MenuItem leftIconName="Branch" onClick={onSwitchBranchDialogOpen}>
              Switch branch...
            </MenuItem>
          )}
          <MenuItem leftIconName="Download" onClick={handleDownload}>
            Download YAML file
          </MenuItem>
          <MenuItem leftIconName="Folder" onClick={handleStorageChange}>
            Change storage...
          </MenuItem>
        </MenuList>
      </Menu>
      <SwitchBranchDialog isOpen={isSwitchBranchDialogOpen} onClose={onSwitchBranchDialogClose} />
      <ConfigurationYmlSourceDialog isOpen={isStorageDialogOpen} onClose={onStorageDialogClose} />
    </Box>
  );
};

export default YmlConfigInfo;
