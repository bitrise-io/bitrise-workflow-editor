import { Box, Text } from '@bitrise/bitkit';

type Props = {
  title: string;
  subtitle: string;
};

const TabHeader = ({ title, subtitle }: Props) => {
  return (
    <Box>
      <Text textStyle="heading/h3">{title}</Text>
      <Text textStyle="body/md/regular" color="text/secondary">
        {subtitle}
      </Text>
    </Box>
  );
};

export default TabHeader;
