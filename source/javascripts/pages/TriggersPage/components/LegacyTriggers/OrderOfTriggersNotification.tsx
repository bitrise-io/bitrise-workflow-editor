import { Link, Notification, Text } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useUserMetaData from '@/hooks/useUserMetaData';

const ORDER_NOTIFICATION_METADATA_KEY = 'wfe_triggers_order_notification_closed';

const OrderOfTriggersNotification = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { value: metaDataValue, update: updateMetaData } = useUserMetaData(
    ORDER_NOTIFICATION_METADATA_KEY,
    isWebsiteMode,
  );

  if (metaDataValue !== null) {
    return null;
  }

  return (
    <Notification status="info" marginTop="12" onClose={() => updateMetaData('true')}>
      <Text fontWeight="bold">Order of triggers</Text>
      <Text>
        The first matching trigger is executed by the system, so make sure that the order of triggers is configured
        correctly.{' '}
        <Link
          href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
          isUnderlined
        >
          Learn more
        </Link>
      </Text>
    </Notification>
  );
};

export default OrderOfTriggersNotification;
