import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Input,
  Link,
  List,
  ListItem,
  Notification,
  Radio,
  RadioGroup,
  Text,
  Tooltip,
  useToast,
} from '@bitrise/bitkit';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import YmlDialogErrorNotification from '@/components/unified-editor/UpdateConfigurationDialog/YmlDialogErrorNotification';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import BitriseYmlSettingsApi from '@/core/api/BitriseYmlSettingsApi';
import { ClientError } from '@/core/api/client';
import { bitriseYmlStore, initializeStore } from '@/core/stores/BitriseYmlStore';
import { download, getFormattedDate } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfig, useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings, usePutCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import { useFormatYml } from '@/hooks/useFormattedYml';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CiConfigSource = 'bitrise' | 'git';
type ConfigSourceGroupProps = {
  isDisabled?: boolean;
  value: CiConfigSource;
  onChange: (value: CiConfigSource) => void;
};

const ConfigSourceGroup = (props: ConfigSourceGroupProps) => {
  return (
    <>
      <Text textStyle="body/md/semibold" marginBlockEnd="12">
        Source
      </Text>
      <RadioGroup {...props}>
        <Radio helperText="Store and manage all your configuration on bitrise.io." marginBlockEnd="12" value="bitrise">
          bitrise.io
        </Radio>
        <Radio
          helperText="The configuration is stored, versioned, and maintained in your Git repository."
          marginBlockEnd="24"
          value="git"
        >
          Git repository
        </Radio>
      </RadioGroup>
    </>
  );
};

type GitYmlRootPathSectionProps = {
  value: string;
  isDisabled?: boolean;
  defaultValue?: string | null;
  onChange: (value: string) => void;
};

const GitYmlRootPathSection = ({ defaultValue, onChange, ...props }: GitYmlRootPathSectionProps) => {
  const gitRepoSlug = PageProps.app()?.gitRepoSlug;

  return (
    <>
      <Input
        {...props}
        isRequired
        marginInlineStart="32"
        label="Bitrise.yml location"
        onChange={(e) => onChange(e.target.value)}
        helperText="Define the source of your configuration file."
        placeholder={defaultValue === '' ? '' : 'example/configs'}
        leftAddon={
          <Box maxWidth="124" padding="8px 12px" display="flex" title={gitRepoSlug}>
            <Text textStyle="body/md/regular" hasEllipsis>
              {gitRepoSlug}
            </Text>
            <Text textStyle="body/md/regular">/</Text>
          </Box>
        }
        rightAddon={
          <Text padding="8px 12px" textStyle="body/md/regular">
            /bitrise.yml
          </Text>
        }
        inputWrapperStyle={{
          background: 'background/disabled',
          border: '1px solid #dfdae1',
          borderRadius: '4',
        }}
      />
      {defaultValue !== null && (
        <Notification status="warning" marginBlockStart="24">
          Ensure that Bitrise has access to all repositories where configuration files are stored.
        </Notification>
      )}
    </>
  );
};

type BitriseToGitSectionProps = {
  initialYmlRootPath?: string | null;
};

const BitriseToGitSection = ({ initialYmlRootPath }: BitriseToGitSectionProps) => {
  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const { mutate: formatYml, isPending } = useFormatYml();

  const gitRepoSlug = PageProps.app()?.gitRepoSlug;
  const defaultBranch = PageProps.app()?.defaultBranch;

  const onCopyClick = () => {
    formatYml(bitriseYmlStore.getState().yml, {
      onSuccess: async (formattedYml) => {
        const isCopied = await copyToClipboard(formattedYml);
        if (isCopied) {
          toast({
            status: 'success',
            description: 'Copied to clipboard',
            isClosable: true,
          });
        } else {
          toast({
            status: 'error',
            description: 'Copy to clipboard failed',
            isClosable: true,
          });
        }
      },
      onError: () => {
        toast({
          status: 'error',
          description: 'Copy preparation failed',
          isClosable: true,
        });
      },
    });
  };

  const onDownloadClick = () => {
    formatYml(bitriseYmlStore.getState().yml, {
      onSuccess: (formattedYml) => download(formattedYml, 'bitrise.yml', 'application/yaml;charset=utf-8'),
      onError: () => {
        toast({
          status: 'error',
          description: 'Download preparation failed',
          isClosable: true,
        });
      },
    });
  };

  return (
    <>
      <Divider marginY="24" />
      <Text marginBlockEnd="4" textStyle="heading/h3">
        Complete the following tasks
      </Text>
      <Text marginBlockEnd="24" textStyle="body/md/regular">
        Make sure to complete all the mandatory tasks before updating. A missing or invalid configuration file can lead
        to failed builds.
      </Text>
      <List variant="ordered">
        <ListItem>
          Add configuration YAML to your repository
          <Text textStyle="body/md/regular" color="text/secondary" marginBlockEnd="12">
            Add your current configuration YAML to{' '}
            <Text as="span" textStyle="body/md/semibold">
              {initialYmlRootPath}
            </Text>{' '}
            on the{' '}
            <Text as="span" textStyle="body/md/semibold">
              {defaultBranch}
            </Text>{' '}
            branch of your{' '}
            <Text as="span" textStyle="body/md/semibold">
              {gitRepoSlug}
            </Text>{' '}
            repository.{' '}
          </Text>
          <Box display="flex" gap="8" pb="24">
            <Button
              size="sm"
              width="fit-content"
              variant="secondary"
              isDisabled={isPending}
              leftIconName="Download"
              onClick={onDownloadClick}
            >
              Download bitrise.yml
            </Button>
            <Button
              size="sm"
              width="fit-content"
              variant="secondary"
              isDisabled={isPending}
              leftIconName="Duplicate"
              onClick={onCopyClick}
            >
              Copy YML contents
            </Button>
          </Box>
        </ListItem>
        <ListItem>
          Provide repository access
          <Text textStyle="body/md/regular" color="text/secondary" marginBlockEnd="24">
            Ensure Bitrise has read access to all the repositories where you store your configuration files.{' '}
            <Link
              isExternal
              colorScheme="purple"
              href="https://devcenter.bitrise.io/en/connectivity/connecting-to-services/connecting-your-github-gitlab-bitbucket-account-to-bitrise.html#github-app-integration"
            >
              Learn more
            </Link>
          </Text>
        </ListItem>
        <ListItem>
          Split up your configuration{' '}
          <Text as="span" color="text/secondary">
            (optional)
          </Text>
          <Text textStyle="body/md/regular" color="text/secondary">
            <Link
              isExternal
              colorScheme="purple"
              href="https://devcenter.bitrise.io/en/builds/configuration-yaml/modular-yaml-configuration.html"
            >
              Follow this guide
            </Link>{' '}
            to split up your configuration into smaller, more manageable files. This feature is only available for
            Workspaces on Enterprise plan.
          </Text>
        </ListItem>
      </List>
    </>
  );
};

type NewCiConfigSource = 'bitrise-ci-config' | 'git-ci-config';
type GitToBitriseSectionProps = {
  value: NewCiConfigSource;
  isDisabled?: boolean;
  lastModifiedFormatted?: string | null;
  onChange: (value: NewCiConfigSource) => void;
};

const GitToBitriseSection = ({ lastModifiedFormatted, onChange, ...props }: GitToBitriseSectionProps) => {
  return (
    <>
      <Divider marginY="24" />
      <Text textStyle="heading/h3" marginBlockEnd="4">
        Set configuration file
      </Text>
      <Text marginBlockEnd="24">Choose which configuration file should be used on bitrise.io from now.</Text>
      <RadioGroup {...props} onChange={(v) => onChange(v as NewCiConfigSource)}>
        <Radio
          value="git"
          marginBlockEnd="12"
          helperText={
            <>
              Multiple configuration files will be merged into a single file.{' '}
              <Link href="https://devcenter.bitrise.io/builds/bitrise-yml-online/" colorScheme="purple" isExternal>
                Learn more
              </Link>
            </>
          }
        >
          Use the configuration file stored in the Git repository
        </Radio>
        <Radio
          value="bitrise"
          helperText={
            lastModifiedFormatted ? <>The source setting was last changed on {lastModifiedFormatted}.</> : undefined
          }
        >
          Use the last version you stored on bitrise.io
        </Radio>
      </RadioGroup>
    </>
  );
};

const DialogContent = ({ onClose }: Pick<ConfigurationYmlSourceDialogProps, 'onClose'>) => {
  const [ymlRootPath, setYmlRootPath] = useState('');
  const [selectedSource, setSelectedSource] = useState<CiConfigSource>('bitrise');
  const [gitToBitriseSource, setGitToBitriseSource] = useState<NewCiConfigSource>('git-ci-config');

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
      setSelectedSource(ymlSettings.usesRepositoryYml ? 'git' : 'bitrise');
    }
  }, [ymlSettings]);

  useEffect(() => {
    setAsyncError(null);
  }, [selectedSource, gitToBitriseSource]);

  const toolTip =
    selectedSource === 'git'
      ? 'You are already storing your configuration in a Git repository.'
      : 'You are already storing your configuration on bitrise.io';

  const showYmlRootPathSection = selectedSource === 'git';
  const isYmlRootPathChanged = (ymlSettings?.ymlRootPath ?? '') !== ymlRootPath;
  const switchBitriseToGit = !ymlSettings?.usesRepositoryYml && selectedSource === 'git';
  const switchGitToBitrise = ymlSettings?.usesRepositoryYml && selectedSource === 'bitrise';
  const isSourceChanged = (ymlSettings?.usesRepositoryYml ? 'git' : 'bitrise') !== selectedSource;
  const isValidateAndSaveDisabled = isYmlSettingsLoading || (!isSourceChanged && !isYmlRootPathChanged);
  const lastModifiedFormatted = ymlSettings?.lastModified ? getFormattedDate(new Date(ymlSettings.lastModified)) : null;
  const isValidateAndSaveLoading =
    isPendingSaveYmlSettings || isFetchingCiConfigFromRepo || isFetchingCiConfigFromBitrise || isPendingSaveCiConfig;

  const initializeStoreAndClose = (data: { ymlString: string; version: string }) => {
    onClose();
    initializeStore(data);
    queryClient.invalidateQueries({
      queryKey: [BitriseYmlSettingsApi.getYmlSettingsPath(PageProps.appSlug())],
    });
  };

  const onValidateAndSave = () => {
    setAsyncError(null);

    if (switchGitToBitrise) {
      switch (gitToBitriseSource) {
        case 'bitrise-ci-config':
          saveYmlSettings(
            {
              usesRepositoryYml: false,
            },
            {
              onSuccess: async () => {
                const { data, error } = await getCiConfigFromBitrise();
                setAsyncError(error);
                if (data)
                  initializeStoreAndClose({
                    ymlString: data.ymlString,
                    version: data.version ?? '',
                  });
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
                      yml: BitriseYmlApi.fromYml(data.ymlString),
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
            if (data)
              initializeStoreAndClose({
                ymlString: data.ymlString,
                version: data.version ?? '',
              });
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
            if (data)
              initializeStoreAndClose({
                ymlString: data.ymlString,
                version: data.version ?? '',
              });
          },
          onError: setAsyncError,
        },
      );
    }
  };

  return (
    <>
      <DialogBody>
        <ConfigSourceGroup value={selectedSource} isDisabled={isYmlSettingsLoading} onChange={setSelectedSource} />

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
            value={gitToBitriseSource}
            isDisabled={isYmlSettingsLoading}
            onChange={setGitToBitriseSource}
            lastModifiedFormatted={lastModifiedFormatted}
          />
        )}

        {asyncError && <YmlDialogErrorNotification error={asyncError} />}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Tooltip label={toolTip} isDisabled={isSourceChanged}>
          <Button
            onClick={onValidateAndSave}
            isLoading={isValidateAndSaveLoading}
            isDisabled={isValidateAndSaveDisabled}
          >
            Validate and save
          </Button>
        </Tooltip>
      </DialogFooter>
    </>
  );
};

const ConfigurationYmlSourceDialog = ({ isOpen, onClose }: ConfigurationYmlSourceDialogProps) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Configuration YAML source">
      <DialogContent onClose={onClose} />
    </Dialog>
  );
};

export default ConfigurationYmlSourceDialog;
