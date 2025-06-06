export type EnvVar = {
  key: string;
  value: string;
  source: string;
  isExpand?: boolean;
};

export enum EnvVarSource {
  App = 'app',
  Workflows = 'workflows',
}
