import useWorkflow from '@/hooks/useWorkflow';

const useWorkflowStackAndMachine = (id: string) => {
  return useWorkflow(id, (s) => ({
    stackId: s?.userValues.meta?.['bitrise.io']?.stack || '',
    machineTypeId: s?.userValues.meta?.['bitrise.io']?.machine_type_id || '',
    stackRollbackVersion: s?.userValues.meta?.['bitrise.io']?.stack_rollback_version || '',
  }));
};

export default useWorkflowStackAndMachine;
