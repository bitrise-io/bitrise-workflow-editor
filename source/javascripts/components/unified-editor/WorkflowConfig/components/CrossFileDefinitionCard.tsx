import { Card } from '@chakra-ui/react/card';
import { Text } from '@chakra-ui/react/text';

type Props = {
  title: string;
  definingPath?: string;
};

// Informational only: nothing here is editable, so it is a plain card rather than an expandable one.
// Padding and text styles match the BitkitExpandableCard headers it sits next to.
const CrossFileDefinitionCard = ({ title, definingPath }: Props) => (
  <Card.Root elevation={false} paddingSize="sm">
    <Card.Body>
      <Text textStyle="body/lg/regular">{title}</Text>
      <Text textStyle="body/md/regular" color="text/secondary">
        Defined in{' '}
        {definingPath ? (
          <Text as="span" textStyle="body/md/semibold">
            {definingPath}
          </Text>
        ) : (
          'another file'
        )}
        . Edit it there.
      </Text>
    </Card.Body>
  </Card.Root>
);

export default CrossFileDefinitionCard;
