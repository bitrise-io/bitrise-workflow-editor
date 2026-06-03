import { Box, Link, Text } from '@bitrise/bitkit';

import LegacyTriggers from './components/LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from './components/TargetBasedTriggers/TargetBasedTriggers';
import SetupWebhookNotification from './SetupWebhookNotification';

const TriggersPage = () => {
  return (
    <Box p="32">
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4">
        Triggers
      </Text>
      <Text color="text/secondary" marginBlockEnd="32">
        Triggers help you start builds automatically.{' '}
        <Link
          colorScheme="purple"
          href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      <SetupWebhookNotification />
      <TargetBasedTriggers />
      <LegacyTriggers />
    </Box>
  );
};

export default TriggersPage;
