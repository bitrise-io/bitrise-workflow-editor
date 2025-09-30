import { useMemo } from 'react';

import WorkflowService from '@/core/services/WorkflowService';

import { useWorkflows } from './useWorkflows';

const useWorkflowIds = (excludeUtility?: boolean) => {
  const ids = useWorkflows((s) => Object.keys(s));
  return useMemo(
    () => (excludeUtility ? ids.filter((id) => !WorkflowService.isUtilityWorkflow(id)) : ids),
    [ids, excludeUtility],
  );
};

export default useWorkflowIds;
