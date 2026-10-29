import { BitkitBadge, BitkitExpandableCard } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import SortableEnvVars from '@/components/SortableEnvVars/SortableEnvVars';
import { EnvVarSource } from '@/core/models/EnvVar';

import { useWorkflowConfigContext } from '../WorkflowConfig.context';

const EnvVarsCard = () => {
  const sourceId = useWorkflowConfigContext((s) => s?.id);
  const [errorCount, setErrorCount] = useState(0);

  return (
    <BitkitExpandableCard
      elevation={false}
      noPadding
      suffix={
        errorCount > 0 ? (
          <BitkitBadge variant="bold" colorVariant="red">
            {errorCount}
          </BitkitBadge>
        ) : undefined
      }
      title="Env Vars"
    >
      <SortableEnvVars
        source={EnvVarSource.Workflows}
        sourceId={sourceId}
        listenForExternalChanges
        onValidationErrorsChange={setErrorCount}
        emptyText="No Env Vars defined."
      />
    </BitkitExpandableCard>
  );
};

export default EnvVarsCard;
