import { Link } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

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
    <BitkitAlert
      variant="info"
      marginBlockStart="12"
      data-clarity-unmask="true"
      dismissible
      onClose={() => updateMetaData('true')}
      titleText="Order of triggers"
      messageText={
        <>
          The first matching trigger is executed by the system, so make sure that the order of triggers is configured
          correctly.{' '}
          <Link
            href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
            isUnderlined
          >
            Learn more
          </Link>
        </>
      }
    />
  );
};

export default OrderOfTriggersNotification;
