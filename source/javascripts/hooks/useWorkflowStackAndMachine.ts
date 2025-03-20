import { useMemo } from 'react';
import useWorkflow from '@/hooks/useWorkflow';

const useWorkflowStackAndMachine = (id: string) => {
  const workflow = useWorkflow(id);
  const meta = workflow?.userValues.meta?.['bitrise.io'];

  return useMemo(
    () => ({
      stackId: meta?.stack || '',
      machineTypeId: meta?.machine_type_id || '',
      stackRollbackVersion: meta?.stack_rollback_version || '',
    }),
    [meta],
  );
};

export default useWorkflowStackAndMachine;
