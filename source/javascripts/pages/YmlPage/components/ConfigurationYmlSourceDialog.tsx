import { useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
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

import YmlDialogErrorNotification from '@/components/unified-editor/UpdateConfigurationDialog/YmlDialogErrorNotification';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { useGetCiConfigYml, useSaveCiConfigYml } from '@/hooks/useCiConfig';
import { usePutCiConfigSettingsMutation } from '@/hooks/useCiConfigSettings';
import { getFormattedDate } from '@/core/utils/CommonUtils';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialUsesRepositoryYml: boolean;
  projectSlug: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  defaultBranch: string;
  gitRepoSlug: string;
  lastModified: string | null;
  initialYmlRootPath: string | null;
  ciConfigYml: string;
};

// TODO: Refactor this component please
const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const {
    defaultBranch,
    gitRepoSlug,
    isOpen,
    onClose,
    initialUsesRepositoryYml,
    projectSlug,
    onConfigSourceChangeSaved,
    lastModified,
    initialYmlRootPath,
    ciConfigYml,
  } = props;

  const ciConfigFromRepo = useRef<string>();

  const [configurationSource, setConfigurationSource] = useState<'bitrise' | 'git'>('git');
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(initialUsesRepositoryYml);
  const [ymlRootPath, setYmlRootPath] = useState(initialYmlRootPath || '');

  const onSuccess = () => {
    onClose();
    toast({
      title: 'Source succesfully changed',
      description: usesRepositoryYml
        ? `From now you can manage your Configuration YAML in the project's git repository.`
        : 'From now you can manage your Configuration YAML on bitrise.io.',
      status: 'success',
      isClosable: true,
    });
    onConfigSourceChangeSaved(usesRepositoryYml, ymlRootPath);
    segmentTrack('Configuration Yml Source Successfully Changed Message Shown', {
      yml_source: usesRepositoryYml ? 'git' : 'bitrise',
    });
  };

  const {
    error: postCiConfigError,
    isPending: isPostCiConfigPending,
    mutate: postCiConfigMutate,
  } = useSaveCiConfigYml({
    onSuccess,
  });

  const {
    error: putCiConfigSettingsError,
    isPending: isPutCiConfigSettingsPending,
    mutate: putCiConfigSettingsMutate,
  } = usePutCiConfigSettingsMutation({
    onSuccess: () => {
      if (!usesRepositoryYml && configurationSource === 'git' && ciConfigFromRepo.current) {
        postCiConfigMutate({
          data: ciConfigFromRepo.current,
          projectSlug,
        });
      } else {
        onSuccess();
      }
    },
  });

  const {
    error: getCiConfigError,
    isPending: isGetCiConfigPending,
    refetch: getCiConfigFromRepo,
  } = useGetCiConfigYml({ projectSlug, forceToReadFromRepo: true }, { enabled: false });

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
    const eventProps: Record<string, string> = {
      yml_source: usesRepositoryYml ? 'bitrise' : 'git',
    };
    if (!usesRepositoryYml) {
      eventProps.selected_yml_source = configurationSource;
    }
    segmentTrack('Validate And Save Configuration Yml Source Button Clicked', eventProps);
    if (usesRepositoryYml === true) {
      putCiConfigSettingsMutate({
        model: {
          usesRepositoryYml,
          ymlRootPath,
        },
        projectSlug,
      });
    } else {
      if (configurationSource === 'git') {
        getCiConfigFromRepo().then((response) => {
          if (response.data) {
            ciConfigFromRepo.current = response.data;
            putCiConfigSettingsMutate({
              model: {
                usesRepositoryYml,
                ymlRootPath,
              },
              projectSlug,
            });
          }
        });
      }
      if (configurationSource === 'bitrise') {
        putCiConfigSettingsMutate({
          model: {
            usesRepositoryYml,
            ymlRootPath,
          },
          projectSlug,
        });
      }
    }
  };

  let lastModifiedFormatted;
  if (lastModified && lastModified !== null) {
    const date = new Date(lastModified);
    lastModifiedFormatted = getFormattedDate(date);
  }

  const isDialogDisabled = isGetCiConfigPending || isPutCiConfigSettingsPending || isPostCiConfigPending;

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
    <Dialog isOpen={isOpen} onClose={onClose} title="Configuration YAML source">
      <DialogBody>
        <Text textStyle="body/md/semibold" marginBlockEnd="12">
          Source
        </Text>
        <RadioGroup
          onChange={(value: 'bitrise' | 'git') => {
            setUsesRepositoryYml(value === 'git');
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
                  <CopyToClipboard text={ciConfigYml} onCopy={onCopyClick}>
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
        {isGetCiConfigPending && (
          <Notification status="progress" marginBlockStart="24">
            Looking for a configuration file in the app’s repository.
          </Notification>
        )}
        {!!getCiConfigError?.response && <YmlDialogErrorNotification response={getCiConfigError.response} />}
        {!!putCiConfigSettingsError?.response && (
          <YmlDialogErrorNotification response={putCiConfigSettingsError.response} />
        )}
        {!!postCiConfigError?.response && <YmlDialogErrorNotification response={postCiConfigError.response} />}
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
    </Dialog>
  );
};

export default ConfigurationYmlSourceDialog;
