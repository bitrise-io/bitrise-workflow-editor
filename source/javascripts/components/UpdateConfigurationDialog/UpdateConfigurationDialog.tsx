import { ReactElement, useEffect } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Notification, Text, useToast } from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';
import { AppConfig } from '@/models/AppConfig';
import { segmentTrack } from '@/utils/segmentTracking';
import useFormattedYml from '@/hooks/useFormattedYml';
import { BitriseYml } from '@/core/models/BitriseYml';
import useGetAppConfigFromRepoCallback from '../../hooks/api/useGetAppConfigFromRepoCallback';
import YmlNotFoundInRepositoryError from '../common/notifications/YmlNotFoundInRepositoryError';
import YmlInRepositoryInvalidError from '../common/notifications/YmlInRepositoryInvalidError';

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
        return <YmlNotFoundInRepositoryError />;
      case 422:
        return <YmlInRepositoryInvalidError errorMessage={getAppConfigFromRepoFailed?.error_msg || 'Unknown error'} />;
      default:
        return (
          <Notification status="error" marginBlockStart="24">
            {getAppConfigFromRepoFailed?.error_msg || 'Unknown error'}
          </Notification>
        );
    }
  };

  const ymlString = useFormattedYml(appConfig as BitriseYml) || '';

  const toast = useToast();

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
            href={`data:attachment/text,${encodeURIComponent(ymlString)}`}
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
          <CopyToClipboard text={ymlString} onCopy={onCopyClick}>
            <Button variant="tertiary" width="fit-content" size="sm" leftIconName="Duplicate">
              Copy changed configuration
            </Button>
          </CopyToClipboard>
        </Box>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using multiple configuration files
        </Text>
        <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
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
