import { useMemo } from 'react';

import { EnvVar } from '@/core/models/EnvVar';
import PageProps from '@/core/utils/PageProps';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useStepBundles } from '@/hooks/useStepBundles';
import useEnvVars from '@/hooks/useEnvVars';
import { useSecrets } from '@/hooks/useSecrets';

const useEnvVarsAndSecrets = () => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const { envs } = useEnvVars({ workflowIds, stepBundleIds, enabled: true });
  const { data: secrets = [] } = useSecrets({ appSlug: PageProps.appSlug() });

  return useMemo(() => [...envs, ...secrets].sort((a, b) => a.key.localeCompare(b.key)) as EnvVar[], [envs, secrets]);
};

export default useEnvVarsAndSecrets;
