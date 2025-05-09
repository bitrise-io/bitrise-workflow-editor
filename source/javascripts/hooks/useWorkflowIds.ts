import { useMemo } from 'react';

import WorkflowService from '@/core/services/WorkflowService';

import { useWorkflows } from './useWorkflows';

const useWorkflowIds = (excludeUtility?: boolean) => {
  const workflows = useWorkflows();
  const ids = Object.keys(workflows);
  return useMemo(
    () => (excludeUtility ? ids.filter((id) => !WorkflowService.isUtilityWorkflow(id)) : ids),
    [ids, excludeUtility],
  );
};

export default useWorkflowIds;
