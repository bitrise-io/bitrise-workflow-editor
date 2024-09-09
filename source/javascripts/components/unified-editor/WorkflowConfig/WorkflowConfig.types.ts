import { EnvVar } from '@/core/models/EnvVar';

export enum WorkflowConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
}

export type FormValues = {
  properties: {
    name: string;
    summary: string;
    description: string;
  };
  configuration: {
    stackId: string;
    machineTypeId: string;
    envs: EnvVar[];
  };
};
