import {
  Box,
  ControlButton,
  DefinitionTooltip,
  Dot,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Skeleton,
  SkeletonBox,
  Text,
  Tooltip,
  useDisclosure,
} from '@bitrise/bitkit';

import SwitchBranchDialog from '@/components/unified-editor/SwitchBranchDialog/SwitchBranchDialog';
import {
  trackBranchSwitchPopupShown,
  trackChangeStorageButtonClicked,
  trackDownloadYmlClicked,
} from '@/core/analytics/ConfigManagementAnalytics';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import ConfigurationYmlSourceDialog from '@/pages/YmlPage/components/ConfigurationYmlStorageDialog';

const ConfigSettingsBar = () => {
  const {
    isOpen: isSwitchBranchDialogOpen,
    onClose: onSwitchBranchDialogClose,
    onOpen: onSwitchBranchDialogOpen,
  } = useDisclosure();
  const { isOpen: isStorageDialogOpen, onClose: onStorageDialogClose, onOpen: onStorageDialogOpen } = useDisclosure();
  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');
  const hasChanges = useYmlHasChanges();

  const [searchParams] = useSearchParams();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const defaultBranch = PageProps.app()?.defaultBranch;
  const requestedBranch = RuntimeUtils.isWebsiteMode() ? searchParams.branch : undefined;
  const branch = configBranch || requestedBranch || defaultBranch;
  const branchLabel = branch && branch === defaultBranch ? `${branch} (default)` : branch;

  const { data, isPending } = useCiConfigSettings();

  const handleDownload = () => {
    trackDownloadYmlClicked(data?.usesRepositoryYml ? 'git' : 'bitrise', 'config_settings_bar');
    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  const handleStorageChange = () => {
    trackChangeStorageButtonClicked(data?.usesRepositoryYml ? 'git' : 'bitrise');
    onStorageDialogOpen();
  };

  return (
    <Box
      paddingLeft="32"
      paddingRight="12"
      py="12"
      mb="24"
      minH="65"
      borderBottom="1px solid"
      borderColor="border/minimal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8"
    >
      <Box minW={0}>
        <Box display="flex" alignItems="center">
          <Text as="h5" textStyle="body/md/semibold" color="text/primary">
            bitrise.yml
          </Text>
          <Dot backgroundColor="text/primary" size="4" mx="6"></Dot>
          {isPending ? (
            <Skeleton>
              <SkeletonBox height="20px" width="75px" />
            </Skeleton>
          ) : (
            <Text as="h5" textStyle="body/md/semibold" color="text/primary">
              {data?.usesRepositoryYml ? 'in repository' : 'on bitrise.io'}
            </Text>
          )}
        </Box>
        {enableBranchSwitching && data?.usesRepositoryYml && branchLabel && (
          <Box display="flex" alignItems="center" gap="4" mt="4">
            <Icon name="Branch" size="16" color="icon/tertiary" />
            <DefinitionTooltip
              label={`Editing bitrise.yml from ${branchLabel}.`}
              triggerProps={{
                textStyle: 'body/sm/regular',
                color: 'text/secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {branchLabel}
            </DefinitionTooltip>
          </Box>
        )}
      </Box>
      <Menu size="md">
        <MenuButton as={ControlButton} iconName="MoreVertical" color="icon/secondary" size="xs" aria-label="More" />
        <Portal>
          <MenuList>
            {enableBranchSwitching && data?.usesRepositoryYml && (
              <Tooltip isDisabled={!hasChanges} label="Unsaved changes, save or discard first.">
                <MenuItem
                  leftIconName="Branch"
                  onClick={() => {
                    onSwitchBranchDialogOpen();
                    trackBranchSwitchPopupShown();
                  }}
                  isDisabled={hasChanges}
                >
                  Switch branch...
                </MenuItem>
              </Tooltip>
            )}
            <MenuItem leftIconName="Download" onClick={handleDownload}>
              Download YAML file
            </MenuItem>
            <MenuItem leftIconName="Folder" onClick={handleStorageChange} isDisabled={isPending}>
              Change storage...
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
      <SwitchBranchDialog isOpen={isSwitchBranchDialogOpen} onClose={onSwitchBranchDialogClose} />
      <ConfigurationYmlSourceDialog isOpen={isStorageDialogOpen} onClose={onStorageDialogClose} />
    </Box>
  );
};

export default ConfigSettingsBar;
