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
};
