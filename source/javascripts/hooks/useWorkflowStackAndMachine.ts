import { useMemo } from 'react';

import useWorkflow from '@/hooks/useWorkflow';

type Props = {
  workflowId: string;
};
const useWorkflowStackAndMachine = ({ workflowId }: Props) => {
  const workflow = useWorkflow(workflowId);
  return useMemo(
    () => ({
      stackId: workflow?.userValues.meta?.['bitrise.io']?.stack || '',
      machineTypeId: workflow?.userValues.meta?.['bitrise.io']?.machine_type_id || '',
      stackRollbackVersion: workflow?.userValues.meta?.['bitrise.io']?.stack_rollback_version || '',
    }),
    [workflow],
  );
};

export default useWorkflowStackAndMachine;
