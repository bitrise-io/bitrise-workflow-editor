export type EnvVar = {
  key: string;
  value: string;
  source: string;
  isExpand?: boolean;
};

export enum EnvVarSource {
  Project = 'project',
  Workflow = 'workflow',
}
