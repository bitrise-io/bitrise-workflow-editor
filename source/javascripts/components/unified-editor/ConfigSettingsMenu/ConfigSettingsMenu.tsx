import {
  BitkitActionMenu,
  BitkitControlButton,
  BitkitOverflowTooltip,
  BitkitTooltip,
  IconBranch,
  IconChevronDown,
  IconDownload,
  IconFolder,
  IconGlobe,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
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

type Props = BoxProps;

const ConfigSettingsMenu = (props: Props) => {
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
  const usesRepositoryYml = Boolean(data?.usesRepositoryYml);

  // Repo storage → show the branch (with a branch icon); Bitrise storage → a globe + a fixed label.
  const SourceIcon = usesRepositoryYml ? IconBranch : IconGlobe;
  const sourceLabel = usesRepositoryYml ? (branchLabel ?? '') : 'Stored on Bitrise';

  const labelText = (
    <Text as="span" display="inline-block" textStyle="body/md/regular" color="text/secondary" maxWidth="240px" truncate>
      {sourceLabel}
    </Text>
  );

  const handleDownload = () => {
    trackDownloadYmlClicked(data?.usesRepositoryYml ? 'git' : 'bitrise', 'config_settings_bar');
    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  const handleStorageChange = () => {
    trackChangeStorageButtonClicked(data?.usesRepositoryYml ? 'git' : 'bitrise');
    setIsStorageDialogOpen(true);
  };

  return (
    <Box display="flex" alignItems="center" gap="8" {...props}>
      {/* Breadcrumb separator between the "CI configuration" crumb and this selector. */}
      <Text as="span" textStyle="body/md/regular" color="text/tertiary" flexShrink="0">
        •
      </Text>

      <Skeleton loading={isPending} borderRadius="4">
        <Box display="flex" alignItems="center" gap="4" minWidth={0}>
          <SourceIcon size="16" color="icon/tertiary" flexShrink="0" />
          {usesRepositoryYml ? (
            <BitkitOverflowTooltip text={sourceLabel}>{labelText}</BitkitOverflowTooltip>
          ) : (
            labelText
          )}
        </Box>
      </Skeleton>

      <BitkitActionMenu.Root
        size="md"
        positioning={{ placement: 'bottom-end' }}
        trigger={<BitkitControlButton icon={IconChevronDown} label="Configuration options" size="xs" />}
      >
        {enableBranchSwitching && usesRepositoryYml && (
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

export default ConfigSettingsMenu;
