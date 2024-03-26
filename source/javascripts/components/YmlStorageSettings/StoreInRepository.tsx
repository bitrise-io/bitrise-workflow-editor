import { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Notification } from '@bitrise/bitkit';

import useGetAppConfigCallback from '../../hooks/api/useGetAppConfigCallback';
import useGetAppConfigFromRepoCallback from '../../hooks/api/useGetAppConfigFromRepoCallback';
import useUpdatePipelineConfigCallback from '../../hooks/api/useUpdatePipelineConfigCallback';
import { WFEWindow } from '../../typings/global';
import LookingForYmlInRepoProgress from '../common/notifications/LookingForYmlInRepoProgress';
import ValidatingYmlInRepoProgress from '../common/notifications/ValidatingYmlInRepoProgress';
import YmlInRepositoryInvalidError from '../common/notifications/YmlInRepositoryInvalidError';
import YmlNotFoundInRepositoryError from '../common/notifications/YmlNotFoundInRepositoryError';
import RepoYmlStorageActions from '../common/RepoYmlStorageActions';
import ConfirmSwitchToRepositoryYml from './ConfirmSwitchToRepositoryYml';
import StoreInRepositoryDescription from './StoreInRepositoryDescription';

type StorageInRepositoryProps = {
  appSlug: string;
  onCancel(): void;
  onSuccess(): void;
};

const StorageInRepository = ({ appSlug, onCancel, onSuccess }: StorageInRepositoryProps): JSX.Element => {
  const {
    getAppConfigFromRepoStatus,
    getAppConfigFromRepoFailed,
    getAppConfigFromRepoLoading,
    getAppConfigFromRepo,
    appConfigFromRepo,
  } = useGetAppConfigFromRepoCallback(appSlug);
  const { updatePipelineConfigStatus, updatePipelineConfigLoading, updatePipelineConfig } =
    useUpdatePipelineConfigCallback(appSlug, true);
  const { appConfig: currentWebsiteAppConfig, getAppConfig, getAppConfigLoading } = useGetAppConfigCallback(appSlug);
  const [confirmModalVisible, setconfirmModalVisible] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [ymlConfirmedByUser, setYmlConfirmedByUser] = useState(false);

  useEffect(() => {
    getAppConfigFromRepo();
    getAppConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!getAppConfigLoading && !getAppConfigFromRepoLoading && getAppConfigFromRepoStatus && !initialCheckComplete) {
      setInitialCheckComplete(true);
    }
    if (initialCheckComplete && !getAppConfigFromRepoLoading && appConfigFromRepo) {
      updatePipelineConfig();
    }
  }, [
    getAppConfigLoading,
    getAppConfigFromRepoLoading,
    getAppConfigFromRepoStatus,
    initialCheckComplete,
    appConfigFromRepo,
    updatePipelineConfig,
  ]);

  const isFinished = useMemo(() => {
    const isSuccessful = !updatePipelineConfigLoading && updatePipelineConfigStatus === 200;
    if (isSuccessful) {
      onSuccess();
    }

    return isSuccessful;
  }, [updatePipelineConfigLoading, updatePipelineConfigStatus, onSuccess]);

  const checkBitriseYmlInRepository = (): void => {
    getAppConfigFromRepo();
    setconfirmModalVisible(false);
    setYmlConfirmedByUser(true);
  };

  const renderError = (): React.ReactElement => {
    switch (getAppConfigFromRepoStatus) {
      case 404:
        return <YmlNotFoundInRepositoryError />;
      case 422:
        return <YmlInRepositoryInvalidError errorMessage={getAppConfigFromRepoFailed?.error_msg || 'Unknown error'} />;
      default:
        return <Notification status="error">{getAppConfigFromRepoFailed?.error_msg || 'Unknown error'}</Notification>;
    }
  };

  if (!initialCheckComplete) {
    return <LookingForYmlInRepoProgress />;
  }

  if (isFinished) {
    return (
      <Notification margin="x2" status="success">
        {(window as WFEWindow).strings.yml.store_in_repository.success}
      </Notification>
    );
  }

  return (
    <>
      <Box display="flex" flexDirection="column" gap="24">
        <StoreInRepositoryDescription
          title={
            appConfigFromRepo || getAppConfigFromRepoStatus === 422
              ? "Update the bitrise.yml file in your app's repository"
              : 'Add bitrise.yml to the app repository'
          }
          description={
            /* eslint-disable max-len */
            appConfigFromRepo || getAppConfigFromRepoStatus === 422
              ? 'The repository already contains a bitrise.yml file. Update the file in the repository with the content of the current one on bitrise.io. '
              : "You need to add your current bitrise.yml file to the app repository before proceeding. You can either copy the entire content of the file to the clipboard or download the file itself. Please also make sure that the app's Service Credential User has read rights on the repository. "
            /* eslint-enable max-len */
          }
        />

        {currentWebsiteAppConfig && <RepoYmlStorageActions appConfig={currentWebsiteAppConfig} />}

        {ymlConfirmedByUser && getAppConfigFromRepoFailed && renderError()}

        {getAppConfigFromRepoLoading || updatePipelineConfigLoading ? (
          <ValidatingYmlInRepoProgress />
        ) : (
          <ButtonGroup spacing="16">
            <Button variant="primary" onClick={() => setconfirmModalVisible(true)}>
              Update settings
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </ButtonGroup>
        )}
      </Box>

      <ConfirmSwitchToRepositoryYml
        visible={confirmModalVisible}
        onContinue={checkBitriseYmlInRepository}
        onCancel={() => setconfirmModalVisible(false)}
      />
    </>
  );
};

export default StorageInRepository;
