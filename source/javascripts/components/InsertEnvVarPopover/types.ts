export type EnvironmentVariable = {
  key: string;
  value: string;
  source: string;
  isExpand: boolean;
};

export type HandlerFn = (envVar: EnvironmentVariable) => void;
export type CreateEnvVarFormValues = EnvironmentVariable;
