export enum StepConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
  OUTPUTS = 'outputs',
}

export type FormValues = {
  properties: {
    name: string;
    version: string;
  };
};
