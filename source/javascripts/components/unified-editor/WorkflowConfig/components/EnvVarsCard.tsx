import { Badge, Box, ExpandableCard, Text } from '@bitrise/bitkit';
import { useState } from 'react';

import SortableEnvVars from '@/components/SortableEnvVars/SortableEnvVars';
import { EnvVarSource } from '@/core/models/EnvVar';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const ButtonContent = ({ numberOfErrors }: { numberOfErrors: number }) => {
  return (
    <Box display="flex" gap="8">
      <Text textStyle="body/lg/semibold">Env Vars</Text>
      {!!numberOfErrors && (
        <Badge variant="bold" colorScheme="negative">
          {numberOfErrors}
        </Badge>
      )}
    </Box>
  );
};

const EnvVarsCard = () => {
  const workflow = useWorkflowConfigContext();
  const [errorCount, setErrorCount] = useState(0);

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent numberOfErrors={errorCount} />}
    >
      <Box m="-24px" width="auto">
        <SortableEnvVars
          source={EnvVarSource.Workflow}
          sourceId={workflow?.id}
          listenForExternalChanges
          onValidationErrorsChange={setErrorCount}
        />
      </Box>
    </ExpandableCard>
  );
};

export default EnvVarsCard;
