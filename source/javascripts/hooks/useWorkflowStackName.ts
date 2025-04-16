import { useMemo } from 'react';

import StackService from '@/core/services/StackService';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

import useProjectStackAndMachine from './useProjectStackAndMachine';
import useStacksAndMachines from './useStacksAndMachines';

const useWorkflowStackName = (workflowId: string = '') => {
  const { data } = useStacksAndMachines();

  const { projectStackId } = useProjectStackAndMachine();
  const { stackId: workflowStackId } = useWorkflowStackAndMachine(workflowId);

  const stackId = workflowStackId || projectStackId || '';
  const stack = StackService.getStackById(data?.availableStacks || [], stackId);

  return useMemo(() => {
    return stack?.name || stackId || 'Unknown stack';
  }, [stack, stackId]);
};

export default useWorkflowStackName;
