import { ReactElement, useEffect } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Link, Notification, Text, useToast } from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';
import { AppConfig } from '@/core/AppConfig';
import { segmentTrack } from '@/utils/segmentTracking';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useGetAppConfigFromRepoCallback from '@/hooks/api/useGetAppConfigFromRepoCallback';
import { useFormattedYml } from '../RepoYmlStorageActions';

type UpdateConfigurationDialogProps = {
  onClose: () => void;
  appSlug: string;
  getDataToSave: () => AppConfig | string;
  onComplete(): void;
  defaultBranch: string;
  gitRepoSlug: string;
};

const UpdateConfigurationDialog = (props: UpdateConfigurationDialogProps) => {
  const { onClose, appSlug, getDataToSave, onComplete, defaultBranch, gitRepoSlug } = props;

  const { getAppConfigFromRepo, appConfigFromRepo, getAppConfigFromRepoStatus, getAppConfigFromRepoFailed } =
    useGetAppConfigFromRepoCallback(appSlug);

  const appConfig = getDataToSave();

  useEffect(() => {
    if (appConfigFromRepo) {
      onComplete();
    }
  }, [appConfigFromRepo, onComplete]);

  const renderError = (): ReactElement => {
    switch (getAppConfigFromRepoStatus) {
      case 404:
        return (
          <Notification status="error" marginBlockStart="24">
            Couldn't find the bitrise.yml file in the app's repository. Please make sure that the file exists on the
            default branch and the app's Service Credential User has read rights on that.
          </Notification>
        );
      case 422:
        return (
          <Notification status="error" justifyContent="start" marginBlockStart="24">
            <Box display="flex" flexDirection="column" gap="x4">
              <Text>
                {window.strings.yml.store_in_repository.validation_error}{' '}
                <Link isUnderlined color="red.40" href="https://devcenter.bitrise.io/builds/bitrise-yml-online/">
                  valid syntax of the bitrise.yml file.
                </Link>
              </Text>
              <Text>{getAppConfigFromRepoFailed?.error_msg || 'Unknown error'}</Text>
            </Box>
          </Notification>
        );
      default:
        return (
          <Notification status="error" marginBlockStart="24">
            {getAppConfigFromRepoFailed?.error_msg || 'Unknown error'}
          </Notification>
        );
    }
  };

  const yml = useFormattedYml(appConfig);

  const toast = useToast();

  const isModularYAMLMentionsEnabled = useFeatureFlag('enable-modular-yaml-mentions');

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
      source: 'update_configuration_yml_modal',
    });
  };

  const onDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });
  };

  return (
    <Dialog isOpen onClose={onClose} title="Update configuration YAML">
      <DialogBody>
        <Text marginBlockEnd="24">
          If you would like to apply these changes to your configuration, depending on your setup, you need to do the
          following:
        </Text>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using a single configuration file
        </Text>
        <Text marginBlockEnd="16">
          Update the content of the configuration YAML in the {gitRepoSlug} repository’s {defaultBranch} branch.
        </Text>
        <Box display="flex" flexDir="column" gap="8" marginBlockEnd="24">
          <Button
            as="a"
            href={`data:attachment/text,${encodeURIComponent(yml)}`}
            target="_blank"
            download="bitrise.yml"
            variant="tertiary"
            width="fit-content"
            size="sm"
            leftIconName="Download"
            onClick={onDownloadClick}
          >
            Download changed version
          </Button>
          <CopyToClipboard text={yml} onCopy={onCopyClick}>
            <Button variant="tertiary" width="fit-content" size="sm" leftIconName="Duplicate">
              Copy changed configuration
            </Button>
          </CopyToClipboard>
        </Box>
        {isModularYAMLMentionsEnabled && (
          <>
            <Text textStyle="heading/h4" marginBlockEnd="4">
              Using multiple configuration files
            </Text>
            <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
          </>
        )}
        {getAppConfigFromRepoFailed && renderError()}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={getAppConfigFromRepo}>Done</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default UpdateConfigurationDialog;
