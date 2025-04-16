import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import EnvVarsApi from '@/core/api/EnvVarsApi';
import StepApi from '@/core/api/StepApi';
import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import StepService from '@/core/services/StepService';
import WorkflowService from '@/core/services/WorkflowService';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import useDefaultStepLibrary from './useDefaultStepLibrary';

const useDefaultEnvVars = (enabled: boolean) => {
  const appSlug = PageProps.appSlug();
  const projectType = useBitriseYmlStore((s) => s.yml.project_type);

  return useQuery({
    enabled,
    initialData: [],
    queryKey: ['default-env-vars', appSlug, projectType],
    queryFn: ({ signal }) => EnvVarsApi.getEnvVars({ appSlug, projectType, signal }),
  });
};

const useAppLevelEnvVars = () => {
  return useBitriseYmlStore((s) => {
    const envVarMap = new Map<string, EnvVar>();

    s.yml.app?.envs?.forEach((envVarYml) => {
      const env = EnvVarService.parseYmlEnvVar(envVarYml, 'Project env vars');
      envVarMap.set(env.key, env);
    });

    return Array.from(envVarMap.values());
  });
};

const useStepBundleLevelEnvVars = (ids: string[]) => {
  return useBitriseYmlStore((s) => {
    const envVarMap = new Map<string, EnvVar>();

    ids.forEach((stepBundleId) => {
      s.yml.step_bundles?.[stepBundleId]?.inputs?.forEach((envVarYml) => {
        const env = EnvVarService.parseYmlEnvVar(envVarYml, `Step bundle: ${stepBundleId}`);
        envVarMap.set(env.key, env);
      });
    });

    return Array.from(envVarMap.values());
  });
};

const useWorkflowLevelEnvVars = (ids: string[]) => {
  return useBitriseYmlStore((s) => {
    const envVarMap = new Map<string, EnvVar>();

    ids.forEach((workflowId) => {
      WorkflowService.getWorkflowChain(s.yml.workflows ?? {}, workflowId).forEach((id) => {
        s.yml.workflows?.[id]?.envs?.forEach((envVarYml) => {
          const env = EnvVarService.parseYmlEnvVar(envVarYml, `Workflow: ${id}`);
          envVarMap.set(env.key, env);
        });
      });
    });

    return Array.from(envVarMap.values());
  });
};

const useStepLevelEnvVars = (ids: string[], enabled: boolean) => {
  const defaultStepLibrary = useDefaultStepLibrary();
  const cvss = useBitriseYmlStore((s) => {
    const cvsSet = new Set<string>();

    ids.forEach((workflowId) => {
      WorkflowService.getWorkflowChain(s.yml.workflows ?? {}, workflowId).forEach((id) => {
        s.yml.workflows?.[id]?.steps?.forEach((ymlStepObject) => {
          const [cvs, step] = Object.entries(ymlStepObject)[0];
          // TODO: Handle step bundles and with groups...
          if (StepService.isStep(cvs, defaultStepLibrary, step)) {
            cvsSet.add(cvs);
          }
        });
      });
    });

    return Array.from(cvsSet).filter(Boolean);
  });

  return useQueries({
    queries: cvss.map((cvs) => ({
      enabled,
      queryKey: ['steps', { cvs, defaultStepLibrary }],
      queryFn: () => StepApi.getStepByCvs(cvs, defaultStepLibrary),
    })),
    combine: (result) => {
      const envVarMap = new Map<string, EnvVar>();
      const isLoading = result.some((r) => r.isLoading);

      if (!isLoading) {
        result.forEach(({ data: step }) => {
          const source = step?.title || step?.id || step?.cvs || '';
          step?.defaultValues?.outputs?.forEach((ymlEnvVar) => {
            const env = EnvVarService.parseYmlEnvVar(ymlEnvVar, `Step: ${source}`);
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

type Props = {
  enabled: boolean;
  stepBundleIds?: string[];
  workflowIds: string[];
};

const useEnvVars = ({ enabled, stepBundleIds, workflowIds }: Props) => {
  const envVarMap = new Map<string, EnvVar>();
  const appLevelEnvVars = useAppLevelEnvVars();
  const stepBundleLevelEnvVars = useStepBundleLevelEnvVars(stepBundleIds || []);
  const workflowLevelEnvVars = useWorkflowLevelEnvVars(workflowIds);
  const { data: defaultEnvVars, isLoading: isLoadingDefaultEnvVars } = useDefaultEnvVars(enabled);
  const { data: stepLevelEnvVars, isLoading: isLoadingStepLevelEnvVars } = useStepLevelEnvVars(workflowIds, enabled);

  const isLoading = isLoadingDefaultEnvVars || isLoadingStepLevelEnvVars;

  if (!isLoading && defaultEnvVars && stepLevelEnvVars) {
    defaultEnvVars.forEach((env) => envVarMap.set(env.key, env));
    appLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
    stepBundleLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
    workflowLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
    stepLevelEnvVars.forEach((env) => envVarMap.set(env.key, env));
  }

  const envs = Array.from(envVarMap.values());

  return useMemo(() => ({ envs, isLoading }), [envs, isLoading]);
};

export default useEnvVars;
