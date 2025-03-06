import { useMemo } from 'react';

import { EnvVar } from '@/core/models/EnvVar';
import PageProps from '@/core/utils/PageProps';
import { useWorkflows } from '@/hooks/useWorkflows';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';

const useEnvVarsAndSecrets = () => {
  const workflows = useWorkflows();
  const ids = Object.keys(workflows);
  const { envs } = useEnvVars({ workflowIds: ids, enabled: true });
  const { data: secrets = [] } = useSecrets({ appSlug: PageProps.appSlug() });

  return useMemo(() => [...envs, ...secrets].sort((a, b) => a.key.localeCompare(b.key)) as EnvVar[], [envs, secrets]);
};

export default useEnvVarsAndSecrets;
