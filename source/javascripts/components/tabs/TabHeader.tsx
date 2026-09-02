import { Box, Text } from '@bitrise/bitkit';

type Props = {
  title: string;
  subtitle: string;
};

const TabHeader = ({ title, subtitle }: Props) => {
  return (
    // Both call sites pass fixed section copy; keep it that way if a dynamic title is ever needed.
    <Box data-clarity-unmask="true">
      <Text as="h3" textStyle="heading/h3">
        {title}
      </Text>
      <Text textStyle="body/md/regular" color="text/secondary">
        {subtitle}
      </Text>
    </Box>
  );
};

export default TabHeader;
