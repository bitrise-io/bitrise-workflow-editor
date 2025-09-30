import { useMemo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useStacksAndMachines from '@/hooks/useStacksAndMachines';

const useProjectStackAndMachine = () => {
  const { data } = useStacksAndMachines();
  const meta = useBitriseYmlStore((state) => state.yml.meta?.['bitrise.io']);

  return useMemo(
    () => ({
      projectStackId: meta?.stack ?? (data?.defaultStackId || ''),
      projectMachineTypeId: meta?.machine_type_id || '',
      projectStackRollbackVersion: meta?.stack_rollback_version || '',
    }),
    [data?.defaultStackId, meta?.machine_type_id, meta?.stack, meta?.stack_rollback_version],
  );
};

export default useProjectStackAndMachine;
