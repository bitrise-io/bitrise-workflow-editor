import { Link } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

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
    <BitkitAlert
      variant="info"
      dismissible
      onClose={() => updateMetaData('true')}
      marginBlockEnd="24"
      data-clarity-unmask="true"
      titleText="Triggers"
      messageText={
        <>
          Set up triggers directly in your Workflows or Pipelines. This way a single Git event can trigger multiple
          targets.{' '}
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

export default TargetBasedTriggerNotification;
