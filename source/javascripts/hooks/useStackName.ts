import { useMemo } from 'react';
import StackService from '@/core/services/StackService';
import useStacksAndMachines from './useStacksAndMachines';

const useStackName = (id: string) => {
  const { data } = useStacksAndMachines();
  return useMemo(() => {
    const stack = StackService.getStackById(data?.availableStacks || [], id);
    return stack?.name || id;
  }, [data?.availableStacks, id]);
};

export default useStackName;
