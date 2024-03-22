export type EnvironmentVariable = {
  key: string;
  value: string;
  source: string;
  isExpand: boolean;
};

export type HandlerFn = (environmentVariable: EnvironmentVariable) => void;
export type SelectEnvironmentVariableFormValues = { key: string; filter: string };
