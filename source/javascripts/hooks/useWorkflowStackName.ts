import { useMemo } from 'react';
import StackService from '@/core/services/StackService';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';
import useStacksAndMachines from './useStacksAndMachines';
import useDefaultStackAndMachine from './useDefaultStackAndMachine';

const useWorkflowStackName = (workflowId: string = '') => {
  const { data } = useStacksAndMachines();

  const { stackId: defaultStackId } = useDefaultStackAndMachine();
  const { stackId: workflowStackId } = useWorkflowStackAndMachine(workflowId);

  const stackId = workflowStackId || defaultStackId || '';
  const stack = StackService.getStackById(data?.availableStacks || [], stackId);

  return useMemo(() => {
    return stack?.name || stackId || 'Unknown stack';
  }, [stack, stackId]);
};

export default useWorkflowStackName;
