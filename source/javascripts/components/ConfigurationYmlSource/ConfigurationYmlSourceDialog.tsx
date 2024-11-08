import { ReactNode, useEffect, useState } from 'react';
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
  NotificationProps,
  Radio,
  RadioGroup,
  Text,
  Tooltip,
  useToast,
} from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';
import useGetAppConfigFromRepoCallback from '@/hooks/api/useGetAppConfigFromRepoCallback';
import useUpdatePipelineConfigCallback from '@/hooks/api/useUpdatePipelineConfigCallback';
import usePostAppConfigCallback from '@/hooks/api/usePostAppConfigCallback';
import { AppConfig } from '@/models/AppConfig';
import DateFormatter from '@/utils/dateFormatter';
import { segmentTrack } from '@/utils/segmentTracking';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { useFormattedYml } from '../common/RepoYmlStorageActions';

const ErrorNotification = ({ status, message }: { status?: number; message: string }) => {
  let action: NotificationProps['action'];
  let content: ReactNode = message;
  if (status === 404) {
    content =
      "Couldn't find the bitrise.yml file in the app's repository. Please make sure that the file exists on the default branch and the app's Service Credential User has read rights on that.";
  } else if (message && message.includes('Split configuration requires an Enterprise plan')) {
    content = (
      <>
        <Text fontWeight="bold">Split configuration requires an Enterprise plan</Text>
        Contact our customer support if you'd like to try it out.
      </>
    );
    action = {
      href: 'https://bitrise.io/contact',
      label: 'Contact us',
      target: '_blank',
    };
  } else if (message) {
    content = message;
  } else {
    content = 'Unknown error';
  }

  return (
    <Notification marginBlockStart="24" status="error" action={action}>
      {content}
    </Notification>
  );
};

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialUsesRepositoryYml: boolean;
  appConfig: AppConfig | string;
  appSlug: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  defaultBranch: string;
  gitRepoSlug: string;
  lastModified: string | null;
  initialYmlRootPath: string | null;
};

const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const {
    defaultBranch,
    gitRepoSlug,
    isOpen,
    onClose,
    initialUsesRepositoryYml,
    appConfig,
    appSlug,
    onConfigSourceChangeSaved,
    lastModified,
    initialYmlRootPath,
  } = props;

  const {
    getAppConfigFromRepoStatus,
    getAppConfigFromRepoFailed,
    getAppConfigFromRepoLoading,
    getAppConfigFromRepo,
    getAppConfigFromRepoReset,
    appConfigFromRepo,
  } = useGetAppConfigFromRepoCallback(appSlug);

  const { postAppConfig, postAppConfigStatus, postAppConfigLoading, postAppConfigFailed } = usePostAppConfigCallback(
    appSlug,
    BitriseYmlApi.toYml(appConfigFromRepo),
  );

  const [configurationSource, setConfigurationSource] = useState<'bitrise' | 'git'>('git');
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(initialUsesRepositoryYml);
  const [ymlRootPath, setYmlRootPath] = useState(initialYmlRootPath || '');

  const { updatePipelineConfigStatus, updatePipelineConfigLoading, updatePipelineConfig, updatePipelineConfigReset } =
    useUpdatePipelineConfigCallback(appSlug, usesRepositoryYml, ymlRootPath);

  const yml = useFormattedYml(appConfig);

  const toast = useToast();

  const isSourceSelected = initialUsesRepositoryYml !== usesRepositoryYml;

  let toolTip;
  if (!usesRepositoryYml) {
    toolTip = 'You are already storing your configuration on bitrise.io';
  }
  if (usesRepositoryYml) {
    toolTip = 'You are already storing your configuration in a Git repository.';
  }

  const onValidateAndSave = () => {
    const eventProps: any = {
      yml_source: usesRepositoryYml ? 'bitrise' : 'git',
    };
    if (!usesRepositoryYml) {
      eventProps.selected_yml_source = configurationSource;
    }
    segmentTrack('Validate And Save Configuration Yml Source Button Clicked', eventProps);
    if (configurationSource === 'git') {
      getAppConfigFromRepo();
    }
    if (configurationSource === 'bitrise') {
      updatePipelineConfig();
    }
  };

  useEffect(() => {
    if (getAppConfigFromRepoStatus === 200) {
      updatePipelineConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAppConfigFromRepoStatus]);

  useEffect(() => {
    if (updatePipelineConfigStatus === 200) {
      if (!usesRepositoryYml && configurationSource === 'git') {
        postAppConfig();
      } else {
        onSuccess();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePipelineConfigStatus]);

  useEffect(() => {
    if (postAppConfigStatus === 200) {
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postAppConfigStatus]);

  const onSuccess = () => {
    onCloseDialog();
    toast({
      title: ' Source succesfully changed',
      description: 'From now you can manage your Configuration YAML on bitrise.io.',
      status: 'success',
      isClosable: true,
    });
    onConfigSourceChangeSaved(usesRepositoryYml, ymlRootPath);
    segmentTrack('Configuration Yml Source Successfully Changed Message Shown', {
      yml_source: usesRepositoryYml ? 'git' : 'bitrise',
    });
  };

  const onCloseDialog = () => {
    getAppConfigFromRepoReset();
    updatePipelineConfigReset();
    onClose();
  };

  let lastModifiedFormatted;
  if (lastModified !== null) {
    const date = new Date(lastModified);
    lastModifiedFormatted = DateFormatter.getFormattedDate(date);
  }

  const isDialogDisabled = getAppConfigFromRepoLoading || updatePipelineConfigLoading || postAppConfigLoading;

  const onCopyClick = () => {
    toast({
      title: ' Copied to clipboard',
      description:
        'Commit the content of the current configuration YAML file to the project’s repository before updating the setting. ',
      status: 'success',
      isClosable: true,
    });
    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'configuration_yml_source',
    });
  };

  const onDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'configuration_yml_source',
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onCloseDialog} title="Configuration YAML source">
      <DialogBody>
        <Text textStyle="body/md/semibold" marginBlockEnd="12">
          Source
        </Text>
        <RadioGroup
          onChange={(value: 'bitrise' | 'git') => {
            setUsesRepositoryYml(value === 'git');
            getAppConfigFromRepoReset();
            updatePipelineConfigReset();
          }}
          value={usesRepositoryYml ? 'git' : 'bitrise'}
          isDisabled={isDialogDisabled}
        >
          <Radio
            helperText="Store and manage all your configuration on bitrise.io."
            marginBlockEnd="12"
            value="bitrise"
          >
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
        {usesRepositoryYml && (
          <>
            <Input
              label="Bitrise.yml location"
              value={ymlRootPath}
              onChange={(e) => setYmlRootPath(e.target.value)}
              leftAddon={
                <Box maxWidth="124" padding="8px 12px" display="flex">
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
                getAppConfigFromRepoReset();
                updatePipelineConfigReset();
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
                    href={`data:attachment/text,${encodeURIComponent(yml)}`}
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
                  <CopyToClipboard text={yml} onCopy={onCopyClick}>
                    <Button
                      variant="secondary"
                      leftIconName="Duplicate"
                      width="fit-content"
                      size="sm"
                      marginBlockEnd="24"
                    >
                      Copy YML contents
                    </Button>
                  </CopyToClipboard>
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
        {getAppConfigFromRepoLoading && (
          <Notification status="progress" marginBlockStart="24">
            Looking for a configuration file in the app’s repository.
          </Notification>
        )}
        {getAppConfigFromRepoFailed && (
          <ErrorNotification status={getAppConfigFromRepoStatus} message={getAppConfigFromRepoFailed?.error_msg} />
        )}
        {postAppConfigFailed && (
          <ErrorNotification status={postAppConfigStatus} message={postAppConfigFailed?.error_msg} />
        )}
        {updatePipelineConfigStatus && updatePipelineConfigStatus !== 200 && (
          <ErrorNotification status={getAppConfigFromRepoStatus} message="Unknown error" />
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onCloseDialog}>
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
    </Dialog>
  );
};

export default ConfigurationYmlSourceDialog;
