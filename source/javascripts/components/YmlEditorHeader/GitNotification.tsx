import { Notification } from '@bitrise/bitkit';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';

type MetaDataResult = {
  value: boolean | null;
};

type NotificationProps = {
  split: boolean;
  usesRepositoryYml: boolean;
};

const GitNotification = (props: NotificationProps) => {
  const { split, usesRepositoryYml } = props;
  const gitMetaDataKey = 'wfe_modular_yaml_git_notification_closed';
  const { mutate: putGitNotificationMetaData } = usePutUserMetaData(gitMetaDataKey, true);
  const { data: gitNotification, refetch } = useGetUserMetaData<MetaDataResult>(gitMetaDataKey, {
    enabled: split && usesRepositoryYml,
  });

  const handleGitNotificationClose = () => {
    putGitNotificationMetaData(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const showGitNotification = gitNotification && gitNotification.value === null;

  if (!showGitNotification) {
    return null;
  }

  return (
    <Notification status="info" onClose={handleGitNotificationClose} marginBlockEnd="24">
      Your configuration in the Git repository is split across multiple files, but on this page you can see it as one
      merged YAML.
    </Notification>
  );
};

export default GitNotification;
