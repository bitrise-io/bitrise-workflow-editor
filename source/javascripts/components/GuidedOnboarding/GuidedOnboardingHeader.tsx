import { Box, Icon, Text } from "@bitrise/bitkit";

export const GuidedOnboardingHeader = (): JSX.Element => (
    <Box display="flex" padding="0 18px">
      <Icon name="Info" />{" "}
      <Text size="3" fontWeight="bold" paddingLeft="10px">
        Getting Started Guide
      </Text>
    </Box>
);
