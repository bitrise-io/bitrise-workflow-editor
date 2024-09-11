import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import StepService from '@/core/models/StepService';
import { EnvVar, EnvVarYml } from '@/core/models/EnvVar';
import EnvVarService from '@/core/models/EnvVarService';

function envVarsAreEqual(a: EnvVar, b: EnvVar) {
  return a.key === b.key && a.source === b.source;
}

function appendEnvVar(ymlEnvVar: EnvVarYml, envVars: EnvVar[]);

const useEnvVars = (workflowId: string) => {
  const yml = useBitriseYmlStore(
    useShallow((s) => {
      const result = {
        envs: [] as EnvVar[],
      };

      const addEnvVarToResult = (ymlEnvVar: EnvVarYml, source: string) => {
        const envVar = EnvVarService.parseYmlEnvVar(ymlEnvVar, source);
        if (result.envs.every((e) => !envVarsAreEqual(e, envVar))) {
          result.envs.push(envVar);
        }
      };

      s.yml.app?.envs?.forEach((env) => {
        addEnvVarToResult(env, 'app');
      });

      s.yml.workflows?.[workflowId].envs?.forEach((env) => {
        addEnvVarToResult(env, workflowId);
      });

      s.yml.workflows?.[workflowId].before_run?.forEach((chainWorkflowId) => {
        s.yml.workflows?.[chainWorkflowId].envs?.forEach((env) => {
          addEnvVarToResult(env, chainWorkflowId);
        });
      });

      s.yml.workflows?.[workflowId].after_run?.forEach((chainWorkflowId) => {
        s.yml.workflows?.[chainWorkflowId].envs?.forEach((env) => {
          addEnvVarToResult(env, chainWorkflowId);
        });
      });

      // mapValues(s.yml.services, (service, source) => {
      //   service.envs?.forEach((env) => {
      //     result.envs.push(EnvVarService.parseYmlEnvVar(env, source));
      //   });
      // });

      const cvsList = (s.yml.workflows?.[workflowId]?.steps ?? []).reduce((list, ymlStepObject) => {
        const [cvs, step] = Object.entries(ymlStepObject)[0];

        // TODO handle step bundle and with group
        if (StepService.isStepBundle(cvs, step) || StepService.isWithGroup(cvs, step)) {
          return list;
        }

        return list;
      }, []);

      return result;
    }),
  );
};

export default useEnvVars;
