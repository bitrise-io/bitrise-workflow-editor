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
  /** Rendered in place of the list when there are no env vars — e.g. the merged view's read-only
   * per-file sections show "No Environment Variables defined." instead of an empty, addable table. */
  emptyText?: string;
  renderJumpButton?: (env: SortableEnvVar) => ReactNode;
};

const EnvVarsTable = ({ source, sourceId, initialEnvs, hideAddButton, emptyText, renderJumpButton }: Props) => {
  return (
    <Card as="section" variant="outline">
      <EnvVarsTableHeader />
      <Box>
        {emptyText && !initialEnvs?.length ? (
          <Text paddingInline="32" paddingBlock="16" textStyle="body/md/regular" color="text/secondary">
            {emptyText}
          </Text>
        ) : (
          <SortableEnvVars
            source={source}
            sourceId={sourceId}
            initialEnvs={initialEnvs}
            hideAddButton={hideAddButton}
            renderJumpButton={renderJumpButton}
          />
        )}
      </Box>
    </Card>
  );
};

export default EnvVarsTable;
