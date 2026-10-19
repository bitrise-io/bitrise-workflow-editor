import { Box, Text } from '@bitrise/bitkit';
import { BitkitLink } from '@bitrise/bitkit-v2';

import LegacyTriggers from './components/LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from './components/TargetBasedTriggers/TargetBasedTriggers';
import SetupWebhookNotification from './SetupWebhookNotification';

const TriggersPage = () => {
  return (
    <Box p="32">
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4" data-clarity-unmask="true">
        Triggers
      </Text>
      <Text color="text/secondary" marginBlockEnd="32" data-clarity-unmask="true">
        Triggers help you start builds automatically.{' '}
        <BitkitLink
          colorVariant="purple"
          href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </BitkitLink>
      </Text>
      <SetupWebhookNotification />
      <TargetBasedTriggers />
      <LegacyTriggers />
    </Box>
  );
};

export default TriggersPage;
