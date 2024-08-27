import { Box, Notification, Text } from '@bitrise/bitkit';
import useNavigation from '../../../hooks/useNavigation';

type StepBundlePanelProps = {
  stepDisplayName: string;
};

const StepBundlePanel = ({ stepDisplayName }: StepBundlePanelProps) => {
  const { replace } = useNavigation();

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box as="header" px="24" pt="16">
        <Text as="h3" textStyle="heading/h3">
          {stepDisplayName}
        </Text>
      </Box>
      <Box padding="24">
        <Notification
          action={{
            label: 'Go to YAML page',
            onClick: () => replace('/yml'),
          }}
          status="info"
        >
          <Text textStyle="comp/notification/title">Edit step bundle configuration</Text>
          <Text textStyle="comp/notification/message">
            View more details or edit step bundle configuration in the Configuration YAML page.
          </Text>
        </Notification>
      </Box>
    </Box>
  );
};

export default StepBundlePanel;
