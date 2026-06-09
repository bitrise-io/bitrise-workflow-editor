import { Box, Card, Icon, Text } from '@bitrise/bitkit';

type Props = {
  title: string;
  definingPath?: string;
};

/** Disabled stand-in for a definition-level card (Env Vars, Stack & Machine) when the workflow is a cross-file reference; points the user at the defining file. */
const CrossFileDefinitionCard = ({ title, definingPath }: Props) => (
  <Card variant="outline" opacity={0.6} cursor="not-allowed">
    <Box display="flex" alignItems="center" justifyContent="space-between" padding="16px 24px">
      <Text textStyle="body/lg/semibold" color="text/secondary">
        {title}
      </Text>
      <Icon name="ChevronDown" color="icon/disabled" />
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
  </Card>
);

export default CrossFileDefinitionCard;
