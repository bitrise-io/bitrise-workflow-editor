import { Box, Notification, Text } from '@bitrise/bitkit';
import useNavigation from '@/hooks/useNavigation';

const StepBundleHeader = ({ title }: { title: string }) => (
  <Box as="header" px="24" pt="16">
    <Text as="h3" textStyle="heading/h3">
      {title}
    </Text>
  </Box>
);

const StepBundleContent = () => {
  const { replace } = useNavigation();

  return (
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
  );
};

type StepBundlePanelProps = {
  bundleName: string;
};

const StepBundlePanel = ({ bundleName }: StepBundlePanelProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="8">
      <StepBundleHeader title={bundleName} />
      <StepBundleContent />
    </Box>
  );
};

export { StepBundleHeader, StepBundleContent };
export default StepBundlePanel;
