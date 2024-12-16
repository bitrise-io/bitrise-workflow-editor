import { Avatar, Box, Card, CardProps, Text } from '@bitrise/bitkit';

type Props = CardProps & {
  logo?: string;
  title?: string;
  version?: string;
  description?: string;
};

const AlgoliaStepItem = ({ logo, title, version, description, ...props }: Props) => {
  return (
    <Card role="button" display="flex" flexDirection="column" gap="8" p="8" variant="outline" minW="0" {...props}>
      <Box display="flex" gap="8">
        <Avatar
          as="div"
          size="40"
          src={logo}
          variant="step"
          display="flex"
          name={title || ''}
          border="1px solid var(--colors-border-minimal)"
        />
        <Box display="flex" flexDirection="column" justifyContent="center" minW="0">
          <Text textStyle="body/md/semibold" hasEllipsis>
            {title}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary">
            {version}
          </Text>
        </Box>
      </Box>
      <Text textStyle="body/sm/regular" noOfLines={2} color="text/secondary">
        {description}
      </Text>
    </Card>
  );
};

export default AlgoliaStepItem;
