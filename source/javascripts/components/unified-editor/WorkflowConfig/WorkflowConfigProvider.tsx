import { PropsWithChildren } from 'react';

import { WorkflowConfigContext } from './WorkflowConfig.context';

const WorkflowConfigProvider = ({ workflowId, children }: PropsWithChildren<{ workflowId: string }>) => {
  return <WorkflowConfigContext.Provider value={workflowId}>{children}</WorkflowConfigContext.Provider>;
};

export default WorkflowConfigProvider;
