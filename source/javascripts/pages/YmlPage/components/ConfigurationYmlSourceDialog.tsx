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
} from '@bitrise/bitkit';
import { useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import YmlDialogErrorNotification from '@/components/unified-editor/UpdateConfigurationDialog/YmlDialogErrorNotification';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { download, getFormattedDate } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfig, useSaveCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings, usePutCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { useFormatYml } from '@/hooks/useFormattedYml';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConfigSourceGroup = () => {
  return (
    <>
      <Text textStyle="body/md/semibold" marginBlockEnd="12">
        Source
      </Text>
      <RadioGroup
        onChange={(value: 'bitrise' | 'git') => {
          setUsesRepositoryYml(value === 'git');
        }}
        value={usesRepositoryYml ? 'git' : 'bitrise'}
        isDisabled={isYmlSettingsLoading || isPutCiConfigSettingsPending}
      >
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

const DialogContent = ({ onClose }: Pick<ConfigurationYmlSourceDialogProps, 'onClose'>) => {
  const projectSlug = PageProps.appSlug() || '';
  const defaultBranch = PageProps.app()?.defaultBranch || '';
  const gitRepoSlug = PageProps.app()?.gitRepoSlug || '';

  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const { mutate: formatYml, isPending: isFormattingYml } = useFormatYml();
  const {
    data: ciConfigYmlFromRepo,
    error: getCiConfigError,
    isLoading: isGetCiConfigLoading,
    refetch: getCiConfigFromRepo,
  } = useGetCiConfig({ projectSlug, forceToReadFromRepo: true }, { enabled: false });
  const { error: postCiConfigError, isPending: isPostCiConfigPending, mutate: postCiConfigMutate } = useSaveCiConfig();

  const [usesRepositoryYml, setUsesRepositoryYml] = useState(false);
  const [configurationSource, setConfigurationSource] = useState<'bitrise' | 'git'>('git');
  const [ymlRootPath, setYmlRootPath] = useState('');

  const { data: ymlSettings, isLoading: isYmlSettingsLoading } = useCiConfigSettings();
  const initialUsesRepositoryYml = ymlSettings?.usesRepositoryYml;
  const isSourceSelected = initialUsesRepositoryYml !== usesRepositoryYml;

  useEffect(() => {
    if (ymlSettings) {
      setUsesRepositoryYml(ymlSettings.usesRepositoryYml);
      setConfigurationSource(ymlSettings.usesRepositoryYml ? 'git' : 'bitrise');
      setYmlRootPath(ymlSettings.ymlRootPath || '');
    }
  }, [ymlSettings]);

  const {
    error: putCiConfigSettingsError,
    isPending: isPutCiConfigSettingsPending,
    mutate: putCiConfigSettings,
  } = usePutCiConfigSettings({
    onSuccess: () => {
      if (!usesRepositoryYml && configurationSource === 'git' && ciConfigFromRepo.current) {
        postCiConfigMutate({
          projectSlug,
          yml: BitriseYmlApi.fromYml(ciConfigFromRepo.current),
        });
      } else {
        onSuccess();
      }
    },
  });

  const copy = useCallback(
    async (text: string) => {
      if (await copyToClipboard(text)) {
        toast({
          title: 'Copied to clipboard',
          description:
            "Commit the content of the current configuration YAML file to the project's repository before updating the setting.",
          status: 'success',
          isClosable: true,
        });
      } else {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the configuration YAML content.',
          status: 'error',
          isClosable: true,
        });
      }
    },
    [copyToClipboard, toast],
  );

  const onCopyClick = () => {
    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'configuration_yml_source',
    });

    formatYml(bitriseYmlStore.getState().yml, {
      onSuccess: copy,
      onError: () => {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the configuration YAML content.',
          status: 'error',
          isClosable: true,
        });
      },
    });
  };

  const onDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'configuration_yml_source',
    });

    formatYml(bitriseYmlStore.getState().yml, {
      onSuccess: (data) => download(data, 'bitrise.yml', 'application/yaml;charset=utf-8'),
      onError: () => {
        toast({
          title: 'Failed to download',
          description: 'Something went wrong while downloading the configuration YAML file.',
          status: 'error',
          isClosable: true,
        });
      },
    });
  };

  const onSuccess = () => {
    toast({
      title: 'Source successfully changed',
      description: usesRepositoryYml
        ? `From now you can manage your Configuration YAML in the project's git repository.`
        : 'From now you can manage your Configuration YAML on bitrise.io.',
      status: 'success',
      isClosable: true,
    });
    segmentTrack('Configuration Yml Source Successfully Changed Message Shown', {
      yml_source: usesRepositoryYml ? 'git' : 'bitrise',
    });

    // NOTE: It is hacky, but we need to force the YML editor to re-render
    bitriseYmlStore.setState({ discardKey: Date.now() });
    onClose();
  };

  const toolTip = useMemo(() => {
    return usesRepositoryYml
      ? 'You are already storing your configuration in a Git repository.'
      : 'You are already storing your configuration on bitrise.io';
  }, [usesRepositoryYml]);

  const onValidateAndSave = () => {
    const eventProps: Record<string, string> = {
      yml_source: usesRepositoryYml ? 'bitrise' : 'git',
    };
    if (!usesRepositoryYml) {
      eventProps.selected_yml_source = configurationSource;
    }
    segmentTrack('Validate And Save Configuration Yml Source Button Clicked', eventProps);
    if (usesRepositoryYml === true || configurationSource === 'bitrise') {
      putCiConfigSettings({
        usesRepositoryYml,
        ymlRootPath,
      });
      return;
    }

    // configurationSource === 'git'
    getCiConfigFromRepo().then((response) => {
      if (response.data) {
        ciConfigFromRepo.current = response.data.ymlString;
        putCiConfigSettings({
          usesRepositoryYml,
          ymlRootPath,
        });
      }
    });
  };

  let lastModifiedFormatted;
  if (lastModified && lastModified !== null) {
    const date = new Date(lastModified);
    lastModifiedFormatted = getFormattedDate(date);
  }

  return (
    <>
      <DialogBody>
        {usesRepositoryYml && (
          <>
            <Input
              label="Bitrise.yml location"
              value={ymlRootPath}
              onChange={(e) => setYmlRootPath(e.target.value)}
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
              placeholder={initialYmlRootPath === '' ? '' : 'example/configs'}
              helperText="Define the source of your configuration file."
              isRequired
              marginInlineStart="32"
            />
            {initialYmlRootPath !== null && (
              <Notification status="warning" marginBlockStart="24">
                Ensure that Bitrise has access to all repositories where configuration files are stored.
              </Notification>
            )}
          </>
        )}
        {isSourceSelected && !usesRepositoryYml && (
          <>
            <Divider marginY="24" />
            <Text textStyle="heading/h3" marginBlockEnd="4">
              Set configuration file
            </Text>
            <Text marginBlockEnd="24">Choose which configuration file should be used on bitrise.io from now.</Text>
            <RadioGroup
              onChange={(value: 'bitrise' | 'git') => {
                setConfigurationSource(value);
              }}
              value={configurationSource}
              isDisabled={isDialogDisabled}
            >
              <Radio
                helperText={
                  <>
                    Multiple configuration files will be merged into a single file.{' '}
                    <Link
                      href="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
                      colorScheme="purple"
                      isExternal
                    >
                      Learn more
                    </Link>
                  </>
                }
                marginBlockEnd="12"
                value="git"
              >
                Use the configuration file stored in the Git repository
              </Radio>
              <Radio
                helperText={
                  lastModifiedFormatted ? (
                    <>The source setting was last changed on {lastModifiedFormatted}.</>
                  ) : undefined
                }
                value="bitrise"
              >
                Use the last version you stored on bitrise.io
              </Radio>
            </RadioGroup>
          </>
        )}
        {isSourceSelected && usesRepositoryYml && (
          <>
            <Divider marginY="24" />
            <Text marginBlockEnd="4" textStyle="heading/h3">
              Complete the following tasks
            </Text>
            <Text marginBlockEnd="24" textStyle="body/md/regular">
              Make sure to complete all the mandatory tasks before updating. A missing or invalid configuration file can
              lead to failed builds.
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
                <Box display="flex" gap="8">
                  <Button
                    as="a"
                    href={`data:attachment/text,${encodeURIComponent(ciConfigYml)}`}
                    target="_blank"
                    download="bitrise.yml"
                    variant="secondary"
                    leftIconName="Download"
                    width="fit-content"
                    size="sm"
                    onClick={onDownloadClick}
                  >
                    Download bitrise.yml
                  </Button>
                  <Button
                    variant="secondary"
                    leftIconName="Duplicate"
                    width="fit-content"
                    size="sm"
                    marginBlockEnd="24"
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
                    href="https://devcenter.bitrise.io/en/connectivity/connecting-to-services/connecting-your-github-gitlab-bitbucket-account-to-bitrise.html#github-app-integration"
                    colorScheme="purple"
                    isExternal
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
                    href="https://devcenter.bitrise.io/en/builds/configuration-yaml/modular-yaml-configuration.html"
                    colorScheme="purple"
                    isExternal
                  >
                    Follow this guide
                  </Link>{' '}
                  to split up your configuration into smaller, more manageable files. This feature is only available for
                  Workspaces on Enterprise plan.
                </Text>
              </ListItem>
            </List>
          </>
        )}
        {isGetCiConfigLoading && (
          <Notification status="progress" marginBlockStart="24">
            Looking for a configuration file in the app’s repository.
          </Notification>
        )}
        {!!getCiConfigError && <YmlDialogErrorNotification error={getCiConfigError} />}
        {!!putCiConfigSettingsError && <YmlDialogErrorNotification error={putCiConfigSettingsError} />}
        {!!postCiConfigError && <YmlDialogErrorNotification error={postCiConfigError} />}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Tooltip label={toolTip} isDisabled={isSourceSelected}>
          <Button
            onClick={onValidateAndSave}
            isDisabled={!isSourceSelected && ymlRootPath === initialYmlRootPath}
            isLoading={isDialogDisabled}
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
      <DialogContent />
    </Dialog>
  );
};

export default ConfigurationYmlSourceDialog;
