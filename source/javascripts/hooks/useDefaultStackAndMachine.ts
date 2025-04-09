import { useMemo } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

const useDefaultStackAndMachine = () => {
  const { data } = useStacksAndMachines();
  const meta = useBitriseYmlStore((state) => state.yml.meta?.['bitrise.io']);

  return useMemo(() => {
    const stackId = meta?.stack ?? (data?.defaultStackId || '');
    const stackOs = stackId.split('-')[0];

    return {
      stackId,
      machineTypeId: meta?.machine_type_id || '',
      stackRollbackVersion: meta?.stack_rollback_version || '',
      defaultMachineTypeIdForStack: data?.defaultMachineTypeIdOfOSs[stackOs] || '',
    };
  }, [data, meta?.stack, meta?.machine_type_id, meta?.stack_rollback_version]);
};

export default useDefaultStackAndMachine;
