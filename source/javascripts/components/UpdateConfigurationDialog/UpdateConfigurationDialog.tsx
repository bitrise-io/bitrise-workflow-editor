import { ReactElement, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogBody, DialogFooter, Link, Notification, Text, useToast } from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';
import useGetAppConfigFromRepoCallback from '../../hooks/api/useGetAppConfigFromRepoCallback';
import YmlNotFoundInRepositoryError from '../common/notifications/YmlNotFoundInRepositoryError';
import YmlInRepositoryInvalidError from '../common/notifications/YmlInRepositoryInvalidError';
import { useFormattedYml } from '../common/RepoYmlStorageActions';
import { AppConfig } from '../../models/AppConfig';

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

  const [actionSelected, setActionSelected] = useState<string | null>(null);
  const [clearActionTimeout, setClearActionTimeout] = useState<number | undefined>();

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

  const yml = useFormattedYml(appConfig);

  const selectAction = (actionName: string): void => {
    setActionSelected(actionName);

    if (clearActionTimeout) {
      window.clearTimeout(clearActionTimeout);
    }

    setClearActionTimeout(window.setTimeout(() => setActionSelected(null), 5000));
  };

  const toast = useToast();

  if (actionSelected === 'clipboard') {
    toast({
      title: ' Copied to clipboard',
      description:
        'Commit the content of the current configuration YAML file to the app’s repository before updating the setting. ',
      status: 'success',
      isClosable: true,
    });
  }

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
          <Link
            href={`data:attachment/text,${encodeURIComponent(yml)}`}
            target="_blank"
            download="bitrise.yml"
            onClick={() => selectAction('download')}
          >
            <Button variant="tertiary" width="fit-content" size="sm" leftIconName="Download">
              Download changed version
            </Button>
          </Link>
          <CopyToClipboard text={yml} onCopy={() => selectAction('clipboard')}>
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
