import { WorkflowYmlObject } from '@/core/models/Workflow';

type EnvVar = {
  key: string;
  value: string;
  source: string;
  isExpand: boolean;
};

type EnvVarYml = Required<WorkflowYmlObject>['envs'][number] & {
  opts?: {
    is_expand?: boolean;
  };
};

export { EnvVar, EnvVarYml };
