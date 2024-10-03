import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQueries, useQuery } from '@tanstack/react-query';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import StepService from '@/core/models/StepService';
import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/models/EnvVarService';
import EnvVarsApi from '@/core/api/EnvVarsApi';
import WindowUtils from '@/core/utils/WindowUtils';
import StepApi from '@/core/api/StepApi';
import WorkflowService from '@/core/models/WorkflowService';

const useDefaultEnvVars = (enabled: boolean) => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const projectType = useBitriseYmlStore(useShallow((s) => s.yml.project_type));

  return useQuery({
    enabled,
    initialData: [],
    queryKey: ['default-env-vars', appSlug, projectType],
    queryFn: ({ signal }) => EnvVarsApi.getEnvVars({ appSlug, projectType, signal }),
  });
};

const useAppLevelEnvVars = () => {
  return useBitriseYmlStore(
    useShallow((s) => {
      const envVarMap = new Map<string, EnvVar>();

      s.yml.app?.envs?.forEach((envVarYml) => {
        const env = EnvVarService.parseYmlEnvVar(envVarYml, 'app');
        envVarMap.set(env.key, env);
      });

      return Array.from(envVarMap.values());
    }),
  );
};

const useWorkflowLevelEnvVars = (workflowId: string) => {
  return useBitriseYmlStore(
    useShallow((s) => {
      const envVarMap = new Map<string, EnvVar>();

      WorkflowService.getWorkflowChain(s.yml.workflows ?? {}, workflowId).forEach((id) => {
        s.yml.workflows?.[id]?.envs?.forEach((envVarYml) => {
          const env = EnvVarService.parseYmlEnvVar(envVarYml, id);
          envVarMap.set(env.key, env);
        });
      });

      return Array.from(envVarMap.values());
    }),
  );
};

const useStepLevelEnvVars = (workflowId: string, enabled: boolean) => {
  const cvss = useBitriseYmlStore(
    useShallow((s) => {
      const cvsSet = new Set<string>();

      WorkflowService.getWorkflowChain(s.yml.workflows ?? {}, workflowId).forEach((id) => {
        s.yml.workflows?.[id]?.steps?.forEach((ymlStepObject) => {
          const [cvs, step] = Object.entries(ymlStepObject)[0];
          // TODO: Handle step bundles and with groups...
          if (!StepService.isStepBundle(cvs, step) && !StepService.isWithGroup(cvs, step)) {
            cvsSet.add(cvs);
          }
        });
      });

      return Array.from(cvsSet).filter(Boolean);
    }),
  );

  return useQueries({
    queries: cvss.map((cvs) => ({
      enabled,
      queryKey: ['steps', { cvs }],
      queryFn: () => StepApi.getStepByCvs(cvs),
    })),
    combine: (result) => {
      const envVarMap = new Map<string, EnvVar>();
      const isLoading = result.some((r) => r.isLoading);

      if (!isLoading) {
        result.forEach(({ data: step }) => {
          const source = step?.title || step?.id || step?.cvs || '';
          step?.defaultValues?.outputs?.forEach((ymlEnvVar) => {
            const env = EnvVarService.parseYmlEnvVar(ymlEnvVar, source);
            envVarMap.set(env.key, env);
          });
        });
      }

      return {
        isLoading,
        data: Array.from(envVarMap.values()),
      };
    },
  });
};

/**
 * TODO: Load the env vars from each previous workflows and steps only
 * TODO: Handle step bundles and with groups as well
 */
const useEnvVars = (workflowId: string, enabled: boolean) => {
  const envVarMap = new Map<string, EnvVar>();
  const appLevelEnvVars = useAppLevelEnvVars();
  const workflowLevelEnvVars = useWorkflowLevelEnvVars(workflowId);
  const { data: defaultEnvVars, isLoading: isLoadingDefaultEnvVars } = useDefaultEnvVars(enabled);
  const { data: stepLevelEnvVars, isLoading: isLoadingStepLevelEnvVars } = useStepLevelEnvVars(workflowId, enabled);

  const isLoading = isLoadingDefaultEnvVars || isLoadingStepLevelEnvVars;

  if (!isLoading && defaultEnvVars && stepLevelEnvVars) {
    defaultEnvVars.forEach((env) => envVarMap.set(env.key, env));
    appLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
    workflowLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
    stepLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
  }

  const envs = Array.from(envVarMap.values());

  return useMemo(() => ({ envs, isLoading }), [envs, isLoading]);
};

export default useEnvVars;
