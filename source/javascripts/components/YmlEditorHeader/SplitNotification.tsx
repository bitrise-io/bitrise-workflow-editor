import { useEffect, useState } from 'react';
import { Notification, Text } from '@bitrise/bitkit';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';

type NotificationProps = {
  modularYamlSupported?: boolean;
  split: boolean;
  lines: number;
};

const SplitNotification = (props: NotificationProps) => {
  const { modularYamlSupported, split, lines } = props;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const metaDataKey = modularYamlSupported
    ? 'wfe_modular_yaml_enterprise_notification_closed'
    : 'wfe_modular_yaml_split_notification_closed';
  const { call: putNotificationMetaData } = usePutUserMetaData(metaDataKey, true);
  const notificationMetaDataResponse = useGetUserMetaData(metaDataKey);

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
    putNotificationMetaData();
  };

  useEffect(() => {
    if (modularYamlSupported !== undefined) {
      notificationMetaDataResponse.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modularYamlSupported]);

  const showNotification = notificationMetaDataResponse.value === null;

  useEffect(() => {
    if (showNotification === true) {
      setIsNotificationOpen(true);
    }
  }, [showNotification]);

  return (
    <>
      {isNotificationOpen && !split && lines > 500 && (
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
            We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable
            files for easier maintenance.{' '}
            {modularYamlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
          </Text>
        </Notification>
      )}
    </>
  );
};

export default SplitNotification;
