import { Box, Card, Text } from '@bitrise/bitkit';

import SortableEnvVars from '@/components/SortableEnvVars/SortableEnvVars';
import { EnvVarSource } from '@/core/models/EnvVar';

const EnvVarsTableHeader = () => {
  return (
    <Box
      pl="32"
      pr="48"
      as="header"
      height="48"
      display="flex"
      alignItems="center"
      textStyle="heading/h5"
      borderBottom="1px solid"
      borderColor="border/minimal"
    >
      <Text as="span" flex="1">
        Key
      </Text>
      <Text as="span" flex="1">
        Value
      </Text>
    </Box>
  );
};

type Props = {
  source: EnvVarSource;
  sourceId?: string;
};

const EnvVarsTable = ({ source, sourceId }: Props) => {
  return (
    <Card as="section" variant="outline">
      <EnvVarsTableHeader />
      <Box>
        <SortableEnvVars source={source} sourceId={sourceId} />
      </Box>
    </Card>
  );
};

export default EnvVarsTable;
