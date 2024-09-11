import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQueries, useQuery } from '@tanstack/react-query';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import StepService from '@/core/models/StepService';
import { EnvVar, EnvVarYml } from '@/core/models/EnvVar';
import EnvVarService from '@/core/models/EnvVarService';
import { WorkflowYmlObject } from '@/core/models/Workflow';
import EnvVarsApi from '@/core/api/EnvVarsApi';
import WindowUtils from '@/core/utils/WindowUtils';
import StepApi from '@/core/api/StepApi';

function envVarsAreEqual(a: EnvVar, b: EnvVar) {
  return a.key === b.key && a.source === b.source;
}

const useCvsFromYml = (workflowId: string) => {
  return useBitriseYmlStore(
    useShallow((s) => {
      const cvss: string[] = [];

      const collectStepCvssOf = (workflow?: WorkflowYmlObject) => {
        workflow?.steps?.forEach((ymlStepObject) => {
          const [cvs, step] = Object.entries(ymlStepObject)[0];

          // TODO: Handle step bundles and with groups...
          if (!StepService.isStepBundle(cvs, step) && !StepService.isWithGroup(cvs, step) && !cvss.includes(cvs)) {
            cvss.push(cvs);
          }
        });
      };

      collectStepCvssOf(s.yml.workflows?.[workflowId]);

      s.yml.workflows?.[workflowId]?.before_run?.forEach((chainWorkflowId) => {
        collectStepCvssOf(s.yml.workflows?.[chainWorkflowId]);
      });

      s.yml.workflows?.[workflowId]?.after_run?.forEach((chainWorkflowId) => {
        collectStepCvssOf(s.yml.workflows?.[chainWorkflowId]);
      });

      return cvss;
    }),
  );
};

const useEnvVarsFromYml = (workflowId: string) => {
  return useBitriseYmlStore(
    useShallow((s) => {
      const envs: EnvVar[] = [];

      const addEnvVar = (env: EnvVarYml, source?: string) => {
        const envVar = EnvVarService.parseYmlEnvVar(env, source);
        if (!envs.some((e) => envVarsAreEqual(e, envVar))) {
          envs.push(envVar);
        }
      };

      s.yml.app?.envs?.forEach((env) => {
        addEnvVar(env, 'app');
      });

      s.yml.workflows?.[workflowId]?.envs?.forEach((env) => {
        addEnvVar(env, workflowId);
      });

      s.yml.workflows?.[workflowId]?.before_run?.forEach((chainWorkflowId) => {
        s.yml.workflows?.[chainWorkflowId]?.envs?.forEach((env) => {
          addEnvVar(env, chainWorkflowId);
        });
      });

      s.yml.workflows?.[workflowId]?.after_run?.forEach((chainWorkflowId) => {
        s.yml.workflows?.[chainWorkflowId]?.envs?.forEach((env) => {
          addEnvVar(env, chainWorkflowId);
        });
      });

      return envs;
    }),
  );
};

const useDefaultEnvVars = () => {
  const appSlug = WindowUtils.appSlug() ?? '';
  const projectType = useBitriseYmlStore(useShallow((s) => s.yml.project_type)) as never;

  return useQuery({
    initialData: [],
    staleTime: Infinity,
    enabled: Boolean(appSlug),
    queryKey: ['default-env-vars', appSlug, projectType],
    queryFn: ({ signal }) => EnvVarsApi.getEnvVars({ appSlug, projectType, signal }),
  });
};

const useStepOutputEnvVars = (workflowId: string) => {
  const cvss = useCvsFromYml(workflowId);

  return useQueries({
    queries: cvss.map((cvs) => ({
      initialData: [],
      staleTime: Infinity,
      enabled: Boolean(cvs),
      queryKey: ['steps', { cvs }],
      queryFn: async () => {
        const step = await StepApi.getStepByCvs(cvs);
        const source = step?.resolvedInfo?.title || step?.resolvedInfo?.id || step?.cvs;
        return step?.defaultValues?.outputs?.map((env) => EnvVarService.parseYmlEnvVar(env, source)) ?? [];
      },
    })),
    combine: (result) => {
      const data: EnvVar[] = [];
      const isPending = result.some((r) => r.isPending);
      const isLoading = result.some((r) => r.isLoading);
      const isFetching = result.some((r) => r.isFetching);

      result.forEach((r) => {
        r.data?.forEach((env) => {
          if (!data.some((e) => envVarsAreEqual(e, env))) {
            data.push(env);
          }
        });
      });

      return {
        data,
        isPending,
        isLoading,
        isFetching,
      };
    },
  });
};

const useEnvVars = (workflowId: string) => {
  const envs = useEnvVarsFromYml(workflowId);
  const { data: defaultEnvVars, isLoading: isLoadingDefaultEnvVars } = useDefaultEnvVars();
  const { data: stepOutputEnvVars, isLoading: isLoadingStepOutputEnvVars } = useStepOutputEnvVars(workflowId);

  const isLoading = isLoadingDefaultEnvVars || isLoadingStepOutputEnvVars;

  defaultEnvVars.forEach((env) => {
    if (!envs.some((e) => envVarsAreEqual(e, env))) {
      envs.push(env);
    }
  });

  stepOutputEnvVars.forEach((env) => {
    if (!envs.some((e) => envVarsAreEqual(e, env))) {
      envs.push(env);
    }
  });

  return useMemo(() => ({ isLoading, envs }), [isLoading, envs]);
};

export default useEnvVars;
