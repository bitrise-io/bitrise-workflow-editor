export enum StepConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
  OUTPUTS = 'outputs',
}

export type FormValues = {
  inputs: Record<string, unknown>;
};
