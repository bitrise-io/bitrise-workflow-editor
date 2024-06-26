export type FormValues = {
  appSlug?: string;
  workflowId: string;
  isMachineTypeSelectorAvailable: boolean;
  configuration: {
    stack: string;
    machineType: string;
    envs: Array<{ key: string; value: string; isExpand: boolean }>;
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
