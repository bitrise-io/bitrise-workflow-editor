import { useMemo } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';
import { EnvVar } from '@/core/models/EnvVar';
import WindowUtils from '@/core/utils/WindowUtils';

const useEnvVarsAndSecrets = () => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const workflows = useWorkflows();
  const ids = Object.keys(workflows);
  const { envs } = useEnvVars(ids, true);
  const { data: secrets = [] } = useSecrets({ appSlug });

  return useMemo(() => [...envs, ...secrets].sort((a, b) => a.key.localeCompare(b.key)) as EnvVar[], [envs, secrets]);
};

export default useEnvVarsAndSecrets;
