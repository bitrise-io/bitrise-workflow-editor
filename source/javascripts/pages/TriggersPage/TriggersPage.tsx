import { BitkitHeading, BitkitLink } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

import LegacyTriggers from './components/LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from './components/TargetBasedTriggers/TargetBasedTriggers';
import SetupWebhookNotification from './SetupWebhookNotification';

const TriggersPage = () => {
  return (
    <Box padding="32">
      <BitkitHeading as="h2" marginBlockEnd="4" data-clarity-unmask="true">
        Triggers
      </BitkitHeading>
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
