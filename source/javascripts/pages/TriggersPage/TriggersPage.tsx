import { BitkitLink } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import ToolPageHeading from '@/components/Navigation/ToolPageHeading';

import LegacyTriggers from './components/LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from './components/TargetBasedTriggers/TargetBasedTriggers';
import SetupWebhookNotification from './SetupWebhookNotification';

const TriggersPage = () => {
  return (
    <>
      <ToolPageHeading
        label="Triggers"
        helperText={
          <>
            Triggers help you start builds automatically.{' '}
            <BitkitLink
              colorVariant="purple"
              href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
              isExternal
            >
              Learn more
            </BitkitLink>
          </>
        }
      />
      <Box paddingInline="32" paddingBlockEnd="32">
        <SetupWebhookNotification />
        <TargetBasedTriggers />
        <LegacyTriggers />
      </Box>
    </>
  );
};

export default TriggersPage;
