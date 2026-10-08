import { Box, ExpandableCard, Text } from '@bitrise/bitkit';
import { BitkitBadge } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import SortableEnvVars from '@/components/SortableEnvVars/SortableEnvVars';
import { EnvVarSource } from '@/core/models/EnvVar';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const ButtonContent = ({ numberOfErrors }: { numberOfErrors: number }) => {
  return (
    <Box display="flex" gap="8">
      <Text textStyle="body/lg/semibold">Env Vars</Text>
      {!!numberOfErrors && (
        <BitkitBadge variant="bold" colorVariant="red">
          {numberOfErrors}
        </BitkitBadge>
      )}
    </Box>
  );
};

const EnvVarsCard = () => {
  const sourceId = useWorkflowConfigContext((s) => s?.id);
  const [errorCount, setErrorCount] = useState(0);

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent numberOfErrors={errorCount} />}
    >
      <Box m="-24px" width="auto">
        <SortableEnvVars
          source={EnvVarSource.Workflows}
          sourceId={sourceId}
          listenForExternalChanges
          onValidationErrorsChange={setErrorCount}
          emptyText="No Env Vars defined."
        />
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;
