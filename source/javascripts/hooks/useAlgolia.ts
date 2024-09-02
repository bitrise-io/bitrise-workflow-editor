import { useQuery } from '@tanstack/react-query';
import StepApi from '@/core/api/StepApi';

function useAlgoliaSteps() {
  return useQuery({
    queryKey: ['algolia-steps'],
    queryFn: () => StepApi.getAlgoliaSteps(),
    staleTime: Infinity,
  });
}

function useAlgoliaStep({ cvs, enabled = true }: { cvs: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ['algolia-steps', { cvs }],
    queryFn: () => StepApi.getAlgoliaStepByCvs(cvs),
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
