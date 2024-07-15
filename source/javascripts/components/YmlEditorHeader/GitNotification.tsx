import { useEffect, useState } from 'react';
import { Notification } from '@bitrise/bitkit';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';

type NotificationProps = {
  split: boolean;
  usesRepositoryYml: boolean;
};

const GitNotification = (props: NotificationProps) => {
  const { split, usesRepositoryYml } = props;
  const [isGitNotificationOpen, setIsGitNotificationOpen] = useState(false);

  const gitMetaDataKey = 'wfe_modular_yaml_git_notification_closed';
  const { call: putGitNotificationMetaData } = usePutUserMetaData(gitMetaDataKey, true);
  const gitNotificationMetaDataResponse = useGetUserMetaData(gitMetaDataKey);

  const handleGitNotificationClose = () => {
    setIsGitNotificationOpen(false);
    putGitNotificationMetaData();
  };

  useEffect(() => {
    console.log('GitNotification component mounted');
    gitNotificationMetaDataResponse.call();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showGitNotification = gitNotificationMetaDataResponse.value === null;

  useEffect(() => {
    if (showGitNotification === true) {
      console.log('Setting isGitNotificationOpen to true');
      setIsGitNotificationOpen(true);
    }
  }, [showGitNotification]);

  return (
    <>
      {isGitNotificationOpen && split && usesRepositoryYml && (
        <Notification status="info" onClose={handleGitNotificationClose} marginBlockEnd="24">
          Your configuration in the Git repository is split across multiple files, but on this page you can see it as
          one merged YAML.
        </Notification>
      )}
    </>
  );
};

export default GitNotification;
