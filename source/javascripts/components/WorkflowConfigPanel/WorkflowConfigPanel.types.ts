export type FormValues = {
  appSlug?: string;
  workflowId: string;
  configuration: {
    stack: string;
    machineType: string;
    envs: Array<{ [key: string]: unknown; isExpand: boolean }>;
  };
  properties: {
    title: string;
    summary: string;
    description: string;
  };
};

export enum WorkflowConfigTab {
  CONFIGURATION = 'configuration',
  PROPERTIES = 'properties',
}
