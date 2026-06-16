import {
  BitkitActionMenu,
  BitkitBadge,
  BitkitControlButton,
  BitkitList,
  BitkitOverflowTooltip,
  BitkitTooltip,
  IconBranch,
  IconCheckCircle,
  IconDownload,
  IconErrorCircle,
  IconFolder,
  IconMoreVertical,
  IconWarning,
  rem,
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
import { useGetCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import ConfigurationYmlSourceDialog from '@/pages/YmlPage/components/ConfigurationYmlStorageDialog';

import SwitchBranchDialog from '../SwitchBranchDialog/SwitchBranchDialog';

const VALIDATION_BADGE = {
  valid: { colorVariant: 'green', icon: IconCheckCircle, label: 'Valid' },
  warnings: { colorVariant: 'yellow', icon: IconWarning, label: 'Warnings' },
  invalid: { colorVariant: 'red', icon: IconErrorCircle, label: 'Invalid' },
} as const;

type Props = BoxProps & {
  showValidationBadge?: boolean;
};

const ConfigSettingsBar = ({ showValidationBadge, ...props }: Props) => {
  const ymlStatus = useYmlValidationStatus();
  const validationBadge = VALIDATION_BADGE[ymlStatus];
  const { isLoading: isCiConfigLoading } = useGetCiConfig({ projectSlug: PageProps.appSlug(), skipValidation: true });
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
      minHeight={rem(65)}
      borderBottom="1px solid"
      borderColor="border/minimal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="12"
      {...props}
    >
      <Box minWidth={0}>
        <BitkitList variant="inline" textColor="body" size="md">
          <BitkitList.Item>bitrise.yml</BitkitList.Item>
          <BitkitList.Item>
            <Skeleton loading={isPending}>{data?.usesRepositoryYml ? 'in repository' : 'on bitrise.io'}</Skeleton>
          </BitkitList.Item>
        </BitkitList>
        {enableBranchSwitching && data?.usesRepositoryYml && branchLabel && (
          <Box display="flex" alignItems="center" gap="4" marginTop="4">
            <IconBranch size="16" color="icon/tertiary" flexShrink="0" />
            <BitkitOverflowTooltip text={branchLabel}>
              <Text textStyle="body/sm/regular" color="text/secondary" truncate flex={1} minWidth={0}>
                {branchLabel}
              </Text>
            </BitkitOverflowTooltip>
          </Box>
        )}
      </Box>
      <Box display="flex" alignItems="center" gap="8">
        <BitkitActionMenu.Root
          size="md"
          trigger={<BitkitControlButton icon={IconMoreVertical} label="More" size="xs" />}
        >
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
        {showValidationBadge && (
          <Skeleton loading={isCiConfigLoading}>
            <BitkitBadge colorVariant={validationBadge.colorVariant} icon={validationBadge.icon} flexShrink="0">
              {validationBadge.label}
            </BitkitBadge>
          </Skeleton>
        )}
      </Box>
      <SwitchBranchDialog isOpen={isSwitchBranchDialogOpen} onClose={() => setIsSwitchBranchDialogOpen(false)} />
      <ConfigurationYmlSourceDialog isOpen={isStorageDialogOpen} onClose={() => setIsStorageDialogOpen(false)} />
    </Box>
  );
};

export default ConfigSettingsBar;
