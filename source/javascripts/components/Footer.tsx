import { Box, Text, Icon, Link } from "@bitrise/bitkit";

type Props = {
  version?: string
}

const Footer = ({ version }: Props) => {
  return (
    <Box 
      py={8}
      px={32}
      gap={12}
      as="footer"
      display="flex" 
      alignItems="center"
      textColor="neutral.40"
      justifyContent="center"
      backgroundColor="neutral.93" 
    >
      {version && <Text size="2" flex="1">{version}</Text>}
      <Text size="2">The Workflow Editor is now open source</Text>
      <Icon name="Heart" color="green.60" />
      <Text size="2">
        Check out the source code{" "}
        <Link href="https://github.com/bitrise-io/bitrise-workflow-editor" isExternal>on GitHub!</Link>
      </Text>
      {version && <Box flex="1" />}
    </Box>
  );
}
 
export default Footer;