export enum WorkflowConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
  TRIGGERS = 'triggers',
}

export type FormValues = {
  properties: {
    name: string;
    summary: string;
    description: string;
  };
};
