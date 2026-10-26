import { IconChevronDown } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card } from '@chakra-ui/react/card';
import { Text } from '@chakra-ui/react/text';

type Props = {
  title: string;
  definingPath?: string;
};

const CrossFileDefinitionCard = ({ title, definingPath }: Props) => (
  <Card.Root elevation={false} opacity={0.6} cursor="not-allowed">
    <Box display="flex" alignItems="center" justifyContent="space-between" padding="16px 24px">
      <Text textStyle="body/lg/semibold" color="text/secondary">
        {title}
      </Text>
      <IconChevronDown color="icon/disabled" />
    </Box>
    <Box padding="0 24px 16px 24px">
      <Text textStyle="body/sm/regular" color="text/secondary">
        Defined in{' '}
        {definingPath ? (
          <Text as="span" textStyle="body/sm/semibold">
            {definingPath}
          </Text>
        ) : (
          'another file'
        )}
        . Edit it there.
      </Text>
    </Box>
  </Card.Root>
);

export default CrossFileDefinitionCard;
