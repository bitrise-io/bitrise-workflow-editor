import { Box, Card, Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import { SortableEnvVar } from '@/components/SortableEnvVars/SortableEnvVarItem';
import SortableEnvVars from '@/components/SortableEnvVars/SortableEnvVars';
import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';

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
  initialEnvs?: EnvVar[];
  hideAddButton?: boolean;
  renderJumpButton?: (env: SortableEnvVar) => ReactNode;
};

const EnvVarsTable = ({ source, sourceId, initialEnvs, hideAddButton, renderJumpButton }: Props) => {
  return (
    <Card as="section" variant="outline">
      <EnvVarsTableHeader />
      <Box>
        <SortableEnvVars
          source={source}
          sourceId={sourceId}
          initialEnvs={initialEnvs}
          hideAddButton={hideAddButton}
          renderJumpButton={renderJumpButton}
        />
      </Box>
    </Card>
  );
};

export default EnvVarsTable;
