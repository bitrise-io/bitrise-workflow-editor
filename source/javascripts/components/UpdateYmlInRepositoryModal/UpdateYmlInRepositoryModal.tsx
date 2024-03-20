import { ReactElement, useEffect } from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogBody, DialogFooter, Notification, Text } from '@bitrise/bitkit';

import useGetAppConfigFromRepoCallback from '../../hooks/api/useGetAppConfigFromRepoCallback';
import { AppConfig } from '../../models/AppConfig';
import LookingForYmlInRepoProgress from '../common/notifications/LookingForYmlInRepoProgress';
import YmlInRepositoryInvalidError from '../common/notifications/YmlInRepositoryInvalidError';
import YmlNotFoundInRepositoryError from '../common/notifications/YmlNotFoundInRepositoryError';
import RepoYmlStorageActions from '../common/RepoYmlStorageActions';

type Props = {
  appSlug: string;
  onClose(): void;
  onComplete(): void;
  getDataToSave: () => AppConfig | string;
};

const UpdateYmlInRepositoryModal = ({ appSlug, getDataToSave, onClose, onComplete }: Props): JSX.Element => {
  const {
    getAppConfigFromRepoLoading,
    getAppConfigFromRepo,
    appConfigFromRepo,
    getAppConfigFromRepoStatus,
    getAppConfigFromRepoFailed,
  } = useGetAppConfigFromRepoCallback(appSlug);
  const dataToSave = getDataToSave();

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
        return <Notification status="error">{getAppConfigFromRepoFailed?.error_msg || 'Unknown error'}</Notification>;
    }
  };

  return (
    <Dialog
      backgroundColor="white"
      onClose={onClose}
      isOpen
      width="640px"
      title="Update the bitrise.yml file in your app's repository"
    >
      <DialogBody>
        <Box display="flex" flexDirection="column" gap="16">
          <Text textColor="neutral.30">
            In order to apply your changes to your next build, you need to update the bitrise.yml file on your
            repository's main branch.
          </Text>
          <RepoYmlStorageActions appConfig={dataToSave} />
          <Text textColor="neutral.30">
            Once you are done, Bitrise will fetch the updated bitrise.yml file from your app's repository, and refresh
            the Workflow Editor. Any unsaved changes will be lost!
          </Text>

          {getAppConfigFromRepoLoading && <LookingForYmlInRepoProgress />}

          {appConfigFromRepo && (
            <Notification margin="8" status="success">
              Fetched bitrise.yml from app repository
            </Notification>
          )}

          {getAppConfigFromRepoFailed && renderError()}
        </Box>
      </DialogBody>
      {!getAppConfigFromRepoLoading && !appConfigFromRepo && (
        <DialogFooter>
          <ButtonGroup display="flex" justifyContent="end" spacing="0" gap="32">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={getAppConfigFromRepo}>
              I'm done
            </Button>
          </ButtonGroup>
        </DialogFooter>
      )}
    </Dialog>
  );
};

export default UpdateYmlInRepositoryModal;
