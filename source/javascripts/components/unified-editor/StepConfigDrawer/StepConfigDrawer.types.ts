export enum StepConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
  OUTPUTS = 'outputs',
}

export type FormValues = {
  configuration: {
    is_always_run: boolean;
    is_skippable: boolean;
    run_if: string;
  };
  properties: {
    name: string;
    version: string;
  };
  inputs: Record<string, unknown>;
};
