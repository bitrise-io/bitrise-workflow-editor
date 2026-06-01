import {
  BitkitActionMenu,
  BitkitControlButton,
  BitkitDefinitionTooltip,
  BitkitTooltip,
  IconBranch,
  IconDownload,
  IconFolder,
  IconMoreVertical,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Skeleton } from '@chakra-ui/react/skeleton';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';

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

import SwitchBranchDialog from '../SwitchBranchDialog/SwitchBranchDialog';

const ConfigSettingsBar = () => {
  const [isSwitchBranchDialogOpen, setIsSwitchBranchDialogOpen] = useState(false);
  const [isStorageDialogOpen, setIsStorageDialogOpen] = useState(false);

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
    setIsStorageDialogOpen(true);
  };

  return (
    <Box
      paddingLeft="32"
      paddingRight="12"
      paddingBlock="12"
      marginBottom="24"
      minHeight={rem(65)}
      borderBottom="1px solid"
      borderColor="border/minimal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8"
    >
      <Box minWidth={0}>
        <Box display="flex" alignItems="center">
          <Text as="h5" textStyle="body/md/semibold" color="text/primary">
            bitrise.yml
          </Text>
          {/* TODO: Change to inline List */}
          <Box width="4" height="4" borderRadius="full" background="text/primary" marginInline="6" flexShrink="0" />
          <Skeleton loading={isPending}>
            <Text as="h5" textStyle="body/md/semibold" color="text/primary">
              {data?.usesRepositoryYml ? 'in repository' : 'on bitrise.io'}
            </Text>
          </Skeleton>
        </Box>
        {enableBranchSwitching && data?.usesRepositoryYml && branchLabel && (
          <Box display="flex" alignItems="center" gap="4" marginTop="4">
            <IconBranch size="16" color="icon/tertiary" />
            <BitkitDefinitionTooltip text={`Editing bitrise.yml from ${branchLabel}.`} textSize="sm">
              {branchLabel}
            </BitkitDefinitionTooltip>
          </Box>
        )}
      </Box>
      <BitkitActionMenu.Root size="md" trigger={<BitkitControlButton icon={IconMoreVertical} label="More" size="xs" />}>
        {enableBranchSwitching && data?.usesRepositoryYml && (
          <BitkitTooltip disabled={!hasChanges} text="Unsaved changes, save or discard first.">
            <BitkitActionMenu.Item
              value="switch-branch"
              icon={IconBranch}
              disabled={hasChanges}
              onClick={() => {
                setIsSwitchBranchDialogOpen(true);
                trackBranchSwitchPopupShown();
              }}
            >
              Switch branch...
            </BitkitActionMenu.Item>
          </BitkitTooltip>
        )}
        <BitkitActionMenu.Item value="download-yml" icon={IconDownload} onClick={handleDownload}>
          Download YAML file
        </BitkitActionMenu.Item>
        <BitkitActionMenu.Item
          value="change-storage"
          icon={IconFolder}
          disabled={isPending}
          onClick={handleStorageChange}
        >
          Change storage...
        </BitkitActionMenu.Item>
      </BitkitActionMenu.Root>
      <SwitchBranchDialog isOpen={isSwitchBranchDialogOpen} onClose={() => setIsSwitchBranchDialogOpen(false)} />
      <ConfigurationYmlSourceDialog isOpen={isStorageDialogOpen} onClose={() => setIsStorageDialogOpen(false)} />
    </Box>
  );
};

export default ConfigSettingsBar;
