import { useMemo } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

const useDefaultStackAndMachine = () => {
  const { data } = useStacksAndMachines();
  const meta = useBitriseYmlStore((state) => state.yml.meta?.['bitrise.io']);

  return useMemo(
    () => ({
      stackId: meta?.stack ?? (data?.defaultStackId || ''),
      machineTypeId: meta?.machine_type_id || '',
      stackRollbackVersion: meta?.stack_rollback_version || '',
    }),
    [meta, data?.defaultStackId],
  );
};

export default useDefaultStackAndMachine;
