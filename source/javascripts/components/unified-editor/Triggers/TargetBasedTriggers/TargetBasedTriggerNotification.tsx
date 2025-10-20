import { Link, Notification, Text } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useUserMetaData from '@/hooks/useUserMetaData';

const TargetBasedTriggerNotification = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const { value: metaDataValue, update: updateMetaData } = useUserMetaData(
    'wfe_target_based_triggering_notification_closed',
    isWebsiteMode,
  );

  if (metaDataValue !== null) {
    return null;
  }

  return (
    <Notification status="info" onClose={() => updateMetaData('true')} marginBlockEnd="24">
      <Text textStyle="heading/h4">Triggers</Text>
      <Text>
        Set up triggers directly in your Workflows or Pipelines. This way a single Git event can trigger multiple
        targets.{' '}
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

export default TargetBasedTriggerNotification;
