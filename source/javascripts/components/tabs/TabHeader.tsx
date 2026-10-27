import { BitkitHeading } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';

type Props = {
  title: string;
  subtitle: string;
};

const TabHeader = ({ title, subtitle }: Props) => {
  return (
    // Both call sites pass fixed section copy; keep it that way if a dynamic title is ever needed.
    <Box data-clarity-unmask="true">
      <BitkitHeading as="h3">{title}</BitkitHeading>
      <Text textStyle="body/md/regular" color="text/secondary">
        {subtitle}
      </Text>
    </Box>
  );
};

export default TabHeader;
