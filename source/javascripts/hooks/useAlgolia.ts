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

function useAlgoliaStep({ cvs, enabled = true }: { cvs: string; enabled?: boolean }) {
  const defaultStepLibrary = useDefaultStepLibrary();
  return useQuery({
    queryKey: ['algolia-steps', { cvs, defaultStepLibrary }] as const,
    queryFn: () => StepApi.getAlgoliaStepByCvs(cvs, defaultStepLibrary),
    enabled: Boolean(cvs && enabled),
    staleTime: Infinity,
  });
}

function useAlgoliaStepInputs({ cvs, enabled = true }: { cvs: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ['algolia-steps', { cvs }, 'inputs'] as const,
    queryFn: () => StepApi.getAlgoliaStepInputsByCvs(cvs),
    enabled: Boolean(cvs && enabled),
    staleTime: Infinity,
  });
}

export { useAlgoliaSteps, useAlgoliaStep, useAlgoliaStepInputs };
