import { useMemo } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const useDefaultStackAndMachine = () => {
  const meta = useBitriseYmlStore((state) => state.yml.meta);
  return useMemo(
    () => ({
      stackId: meta?.['bitrise.io']?.stack || '',
      machineTypeId: meta?.['bitrise.io']?.machine_type_id || '',
      stackRollbackVersion: meta?.['bitrise.io']?.stack_rollback_version || '',
    }),
    [meta],
  );
};

export default useDefaultStackAndMachine;
