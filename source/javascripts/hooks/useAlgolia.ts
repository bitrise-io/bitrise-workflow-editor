import { useQuery } from '@tanstack/react-query';

import StepApi from '@/core/api/StepApi';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

function useAlgoliaSteps() {
  const defaultStepLibrary = useDefaultStepLibrary();
  return useQuery({
    queryKey: ['algolia-steps', { defaultStepLibrary }] as const,
    queryFn: () => StepApi.getAlgoliaSteps(defaultStepLibrary),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export { useAlgoliaSteps };
