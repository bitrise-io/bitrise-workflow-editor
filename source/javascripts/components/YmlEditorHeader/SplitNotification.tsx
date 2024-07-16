import { Notification, Text } from '@bitrise/bitkit';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';

type MetadataResult = {
  value: boolean | null;
};

type NotificationProps = {
  modularYamlSupported?: boolean;
  split: boolean;
  lines: number;
};

const SplitNotification = (props: NotificationProps) => {
  const { modularYamlSupported, split, lines } = props;
  const metaDataKey = modularYamlSupported
    ? 'wfe_modular_yaml_enterprise_notification_closed'
    : 'wfe_modular_yaml_split_notification_closed';
  const { mutate: putNotification } = usePutUserMetaData(metaDataKey, true);
  const { data: notificationMetaData, refetch } = useGetUserMetaData<MetadataResult>(metaDataKey, {
    enabled: !split && lines > 500,
  });

  const handleNotificationClose = () => {
    putNotification(undefined, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const showNotification = notificationMetaData && notificationMetaData.value === null;

  if (!showNotification) {
    return null;
  }

  return (
    <Notification
      status="info"
      action={{
        href: 'https://devcenter.bitrise.io/builds/bitrise-yml-online/',
        label: 'Learn more',
        target: '_blank',
      }}
      onClose={handleNotificationClose}
      marginBlockEnd="24"
    >
      <Text textStyle="heading/h4">Optimize your configuration file</Text>
      <Text>
        We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable files
        for easier maintenance.{' '}
        {modularYamlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
      </Text>
    </Notification>
  );
};

export default SplitNotification;
