import {
  BitkitAlert,
  BitkitButton,
  BitkitDialog,
  BitkitField,
  BitkitLink,
  BitkitList,
  BitkitRadio,
  BitkitRadioGroup,
  BitkitSectionHeading,
  BitkitTooltip,
  createBitkitToast,
  IconCopy,
  IconDownload,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Input } from '@chakra-ui/react/input';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import YmlDialogErrorNotification from '@/components/unified-editor/UpdateConfigurationDialog/YmlDialogErrorNotification';
import {
  trackCopyYmlClicked,
  trackDownloadYmlClicked,
  trackStorageSuccessfullyChanged,
  trackValidateAndSaveStorageClicked,
} from '@/core/analytics/ConfigManagementAnalytics';
import BitriseYmlSettingsApi from '@/core/api/BitriseYmlSettingsApi';
import { ClientError } from '@/core/api/client';
import { forceRefreshStates, getYmlString, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import { download, getFormattedDate } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfig, useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings, usePutCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';

type ConfigurationYmlStorageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CiConfigStorage = 'bitrise' | 'git';
type ConfigStorageGroupProps = {
  isDisabled?: boolean;
  value: CiConfigStorage;
  onChange: (value: CiConfigStorage) => void;
};

const ConfigStorageGroup = ({ isDisabled, onChange, value }: ConfigStorageGroupProps) => {
  return (
    <BitkitRadioGroup
      groupLabel="Storage"
      layout="vertical"
      value={value}
      disabled={isDisabled}
      onValueChange={({ value: v }) => onChange(v as CiConfigStorage)}
    >
      <BitkitRadio
        value="bitrise"
        labelText="bitrise.io"
        helperText="Store and manage all your configuration on bitrise.io."
      />
      <BitkitRadio
        value="git"
        labelText="Git repository"
        helperText="The configuration is stored, versioned, and maintained in your Git repository."
      />
    </BitkitRadioGroup>
  );
};

type GitYmlRootPathSectionProps = {
  value: string;
  isDisabled?: boolean;
  defaultValue?: string | null;
  onChange: (value: string) => void;
};

const GitYmlRootPathSection = ({ defaultValue, isDisabled, onChange, value }: GitYmlRootPathSectionProps) => {
  const gitRepoSlug = PageProps.app()?.gitRepoSlug;

  return (
    <Box marginInlineStart="32" display="flex" flexDirection="column" gap="4">
      <BitkitField label="Bitrise.yml location" helperText="Define the path to your configuration file.">
        <Box
          display="flex"
          alignItems="stretch"
          border="1px solid"
          borderColor="border/regular"
          borderRadius="4"
          overflow="hidden"
        >
          <Box
            display="flex"
            alignItems="center"
            background="background/secondary"
            paddingInline="12"
            maxWidth="128"
            flexShrink="0"
            title={gitRepoSlug}
          >
            <Text textStyle="body/lg/regular" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {gitRepoSlug}
            </Text>
            <Text textStyle="body/lg/regular">/</Text>
          </Box>
          <Input
            value={value}
            disabled={isDisabled}
            placeholder={defaultValue === '' ? '' : 'example/configs'}
            onChange={(e) => onChange(e.target.value)}
          />
          <Box display="flex" alignItems="center" background="background/secondary" paddingInline="12" flexShrink="0">
            <Text textStyle="body/lg/regular">/bitrise.yml</Text>
          </Box>
        </Box>
      </BitkitField>
    </Box>
  );
};

type BitriseToGitSectionProps = {
  initialYmlRootPath?: string | null;
};

const BitriseToGitSection = ({ initialYmlRootPath }: BitriseToGitSectionProps) => {
  const [, copyToClipboard] = useCopyToClipboard();

  const gitRepoSlug = PageProps.app()?.gitRepoSlug;
  const defaultBranch = PageProps.app()?.defaultBranch;

  const onCopyClick = () => {
    trackCopyYmlClicked('bitrise', 'configuration_yml_source');
    copyToClipboard(getYmlString()).then((isCopied) => {
      if (isCopied) {
        createBitkitToast({ variant: 'success', messageText: 'Copied to clipboard' });
      } else {
        createBitkitToast({ variant: 'critical', messageText: 'Copy to clipboard failed' });
      }
    });
  };

  const onDownloadClick = () => {
    trackDownloadYmlClicked('bitrise', 'configuration_yml_source');
    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  return (
    <>
      <Separator />
      <BitkitSectionHeading
        label="Complete the following tasks"
        helperText="Make sure to complete all the mandatory tasks before updating. A missing or invalid configuration file can lead to failed builds."
      />
      <BitkitList variant="explainer" gap="24">
        <BitkitList.Item>
          <Box display="flex" flexDirection="column" gap="8">
            <Box display="flex" flexDirection="column">
              <Text textStyle="body/lg/regular">Add configuration YAML to your repository</Text>
              <Text textStyle="body/md/regular" color="text/secondary">
                Add your current configuration YAML to{' '}
                <Text as="strong" textStyle="body/md/semibold">
                  {initialYmlRootPath}
                </Text>{' '}
                on the{' '}
                <Text as="strong" textStyle="body/md/semibold">
                  {defaultBranch}
                </Text>{' '}
                branch of your{' '}
                <Text as="strong" textStyle="body/md/semibold">
                  {gitRepoSlug}
                </Text>{' '}
                repository.
              </Text>
            </Box>
            <Box display="flex" gap="8">
              <BitkitButton size="sm" variant="secondary" icon={IconDownload} onClick={onDownloadClick}>
                Download bitrise.yml
              </BitkitButton>
              <BitkitButton size="sm" variant="secondary" icon={IconCopy} onClick={onCopyClick}>
                Copy YML contents
              </BitkitButton>
            </Box>
          </Box>
        </BitkitList.Item>
        <BitkitList.Item>
          <Box display="flex" flexDirection="column">
            <Text textStyle="body/lg/regular">Provide repository access</Text>
            <Text textStyle="body/md/regular" color="text/secondary">
              Ensure Bitrise has read access to all the repositories where you store your configuration files.{' '}
              <BitkitLink
                href="https://docs.bitrise.io/en/bitrise-platform/integrations/connecting-your-github-gitlab-bitbucket-account-to-bitrise.html"
                target="_blank"
                colorVariant="purple"
                isExternal
              >
                Learn more
              </BitkitLink>
            </Text>
          </Box>
        </BitkitList.Item>
        <BitkitList.Item>
          <Box display="flex" flexDirection="column">
            <Text textStyle="body/lg/regular">
              Split up your configuration{' '}
              <Text as="span" color="text/secondary">
                (optional)
              </Text>
            </Text>
            <Text textStyle="body/md/regular" color="text/secondary">
              <BitkitLink
                href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuration-yaml/modular-yaml-configuration.html"
                colorVariant="purple"
                isExternal
              >
                Follow this guide
              </BitkitLink>{' '}
              to split up your configuration into smaller, more manageable files. This feature is only available for
              Workspaces on Enterprise plan.
            </Text>
          </Box>
        </BitkitList.Item>
      </BitkitList>
    </>
  );
};

type NewCiConfigStorage = 'bitrise-ci-config' | 'git-ci-config';
type GitToBitriseSectionProps = {
  value: NewCiConfigStorage;
  isDisabled?: boolean;
  lastModifiedFormatted?: string | null;
  onChange: (value: NewCiConfigStorage) => void;
};

const GitToBitriseSection = ({ isDisabled, lastModifiedFormatted, onChange, value }: GitToBitriseSectionProps) => {
  return (
    <>
      <Separator />
      <BitkitSectionHeading
        label="Set configuration file"
        helperText="Choose which configuration file should be used on bitrise.io from now."
      />
      <BitkitRadioGroup
        groupLabel="Configuration file"
        layout="vertical"
        value={value}
        disabled={isDisabled}
        onValueChange={({ value: v }) => onChange(v as NewCiConfigStorage)}
      >
        <BitkitRadio
          value="git-ci-config"
          labelText="Use the configuration file stored in the Git repository"
          helperText="Multiple configuration files will be merged into a single file."
        />
        <BitkitRadio
          value="bitrise-ci-config"
          labelText="Use the last version you stored on bitrise.io"
          helperText={
            lastModifiedFormatted ? `The storage settings were last changed on ${lastModifiedFormatted}.` : undefined
          }
        />
      </BitkitRadioGroup>
    </>
  );
};

const DialogContent = ({ onClose }: Pick<ConfigurationYmlStorageDialogProps, 'onClose'>) => {
  const [ymlRootPath, setYmlRootPath] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<CiConfigStorage>('bitrise');
  const [gitToBitriseStorage, setGitToBitriseStorage] = useState<NewCiConfigStorage>('git-ci-config');

  const [asyncError, setAsyncError] = useState<ClientError | null>(null);

  const queryClient = useQueryClient();
  const currentPage = useCurrentPage();
  const { data: ymlSettings, isLoading: isYmlSettingsLoading } = useCiConfigSettings();
  const { mutate: saveCiConfig, isPending: isPendingSaveCiConfig } = useSaveCiConfig();
  const { mutate: saveYmlSettings, isPending: isPendingSaveYmlSettings } = usePutCiConfigSettings();
  const { refetch: getCiConfigFromRepo, isFetching: isFetchingCiConfigFromRepo } = useGetCiConfig(
    { projectSlug: PageProps.appSlug(), forceToReadFromRepo: true },
    { enabled: false },
  );
  const { refetch: getCiConfigFromBitrise, isFetching: isFetchingCiConfigFromBitrise } = useGetCiConfig(
    { projectSlug: PageProps.appSlug(), forceToReadFromRepo: false },
    { enabled: false },
  );

  useEffect(() => {
    if (ymlSettings) {
      setYmlRootPath(ymlSettings.ymlRootPath || '');
      setSelectedStorage(ymlSettings.usesRepositoryYml ? 'git' : 'bitrise');
    }
  }, [ymlSettings]);

  useEffect(() => {
    setAsyncError(null);
  }, [selectedStorage, gitToBitriseStorage]);

  const toolTip =
    selectedStorage === 'git'
      ? 'You are already storing your configuration in a Git repository.'
      : 'You are already storing your configuration on bitrise.io';

  const showYmlRootPathSection = selectedStorage === 'git';
  const isYmlRootPathChanged = (ymlSettings?.ymlRootPath ?? '') !== ymlRootPath;
  const switchBitriseToGit = !ymlSettings?.usesRepositoryYml && selectedStorage === 'git';
  const switchGitToBitrise = ymlSettings?.usesRepositoryYml && selectedStorage === 'bitrise';
  const isStorageChanged = (ymlSettings?.usesRepositoryYml ? 'git' : 'bitrise') !== selectedStorage;
  const isValidateAndSaveDisabled = isYmlSettingsLoading || (!isStorageChanged && !isYmlRootPathChanged);
  const lastModifiedFormatted = ymlSettings?.lastModified ? getFormattedDate(new Date(ymlSettings.lastModified)) : null;
  const isValidateAndSaveLoading =
    isPendingSaveYmlSettings || isFetchingCiConfigFromRepo || isFetchingCiConfigFromBitrise || isPendingSaveCiConfig;

  const initializeStoreAndClose = (data: { ymlString: string; version: string }) => {
    initializeBitriseYmlDocument(data);
    queryClient.invalidateQueries({
      queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(PageProps.appSlug())],
    });
    createBitkitToast({
      variant: 'success',
      titleText: 'Storage successfully changed',
      messageText:
        selectedStorage === 'git'
          ? `From now you can manage your Configuration YAML in the project's git repository.`
          : 'From now you can manage your Configuration YAML on bitrise.io.',
    });
    trackStorageSuccessfullyChanged(selectedStorage);
    forceRefreshStates();
    onClose();
  };

  const onValidateAndSave = () => {
    trackValidateAndSaveStorageClicked(
      selectedStorage,
      switchGitToBitrise ? (gitToBitriseStorage === 'git-ci-config' ? 'git' : 'bitrise') : undefined,
    );

    setAsyncError(null);
    if (switchGitToBitrise) {
      switch (gitToBitriseStorage) {
        case 'bitrise-ci-config':
          saveYmlSettings(
            {
              usesRepositoryYml: false,
            },
            {
              onSuccess: async () => {
                const { data, error } = await getCiConfigFromBitrise();
                setAsyncError(error);
                if (data) {
                  initializeStoreAndClose(data);
                }
              },
              onError: setAsyncError,
            },
          );
          break;
        case 'git-ci-config':
          saveYmlSettings(
            {
              usesRepositoryYml: false,
            },
            {
              onSuccess: async () => {
                const { data, error } = await getCiConfigFromRepo();
                setAsyncError(error);
                if (data) {
                  saveCiConfig(
                    {
                      ymlString: data.ymlString,
                      projectSlug: PageProps.appSlug(),
                      tabOpenDuringSave: currentPage,
                    },
                    {
                      onSuccess: initializeStoreAndClose,
                      onError: setAsyncError,
                    },
                  );
                }
              },
              onError: setAsyncError,
            },
          );
          break;
      }

      return;
    }

    if (switchBitriseToGit) {
      saveYmlSettings(
        {
          ymlRootPath,
          usesRepositoryYml: true,
        },
        {
          onSuccess: async () => {
            const { data, error } = await getCiConfigFromRepo();
            setAsyncError(error);
            if (data) {
              initializeStoreAndClose(data);
            }
          },
          onError: setAsyncError,
        },
      );

      return;
    }

    if (isYmlRootPathChanged) {
      saveYmlSettings(
        {
          ymlRootPath,
        },
        {
          onSuccess: async () => {
            const { data, error } = await getCiConfigFromRepo();
            setAsyncError(error);
            if (data) {
              initializeStoreAndClose(data);
            }
          },
          onError: setAsyncError,
        },
      );
    }
  };

  return (
    <>
      <BitkitDialog.Body>
        <ConfigStorageGroup value={selectedStorage} isDisabled={isYmlSettingsLoading} onChange={setSelectedStorage} />

        {showYmlRootPathSection && (
          <GitYmlRootPathSection
            value={ymlRootPath}
            isDisabled={isYmlSettingsLoading}
            defaultValue={ymlSettings?.ymlRootPath}
            onChange={setYmlRootPath}
          />
        )}

        {switchBitriseToGit && <BitriseToGitSection initialYmlRootPath={ymlSettings?.ymlRootPath} />}

        {switchGitToBitrise && (
          <GitToBitriseSection
            value={gitToBitriseStorage}
            isDisabled={isYmlSettingsLoading}
            onChange={setGitToBitriseStorage}
            lastModifiedFormatted={lastModifiedFormatted}
          />
        )}
        {asyncError && <YmlDialogErrorNotification error={asyncError} />}
      </BitkitDialog.Body>
      <BitkitDialog.Footer>
        {showYmlRootPathSection && ymlSettings?.ymlRootPath !== null && (
          <BitkitAlert
            variant="warning"
            messageText="Ensure that Bitrise has access to all repositories where configuration files are stored."
          />
        )}
        <BitkitDialog.Buttons>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitTooltip text={toolTip} disabled={isStorageChanged}>
            <BitkitButton
              onClick={onValidateAndSave}
              state={isValidateAndSaveLoading ? 'loading' : isValidateAndSaveDisabled ? 'disabled' : undefined}
            >
              Validate and save
            </BitkitButton>
          </BitkitTooltip>
        </BitkitDialog.Buttons>
      </BitkitDialog.Footer>
    </>
  );
};

const ConfigurationYmlSourceDialog = ({ isOpen, onClose }: ConfigurationYmlStorageDialogProps) => {
  return (
    <BitkitDialog
      title="Configuration YAML storage"
      scrollBehavior="inside"
      showScrollGradient={false}
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
    >
      <DialogContent onClose={onClose} />
    </BitkitDialog>
  );
};

export default ConfigurationYmlSourceDialog;
