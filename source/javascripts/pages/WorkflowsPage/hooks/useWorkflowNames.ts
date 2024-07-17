import { useMemo } from 'react';
import { useWorkflows } from './useWorkflows';

const useWorkflowNames = () => {
  const workflows = useWorkflows();
  return useMemo(() => Object.keys(workflows), [workflows]);
};

export default useWorkflowNames;
