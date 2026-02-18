import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import StepApi from '@/core/api/StepApi';
import { Maintainer } from '@/core/models/Step';
import PageProps from '@/core/utils/PageProps';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

function useAlgoliaSteps() {
  const defaultStepLibrary = useDefaultStepLibrary();
  const allowNonBitriseSteps = PageProps.limits()?.allowNonBitriseSteps ?? true;

  // Apply business logic: if non-Bitrise steps are not allowed, only fetch Bitrise steps
  const maintainers = useMemo(() => {
    return allowNonBitriseSteps ? [] : [Maintainer.Bitrise];
  }, [allowNonBitriseSteps]);

  return useQuery({
    queryKey: ['algolia-steps', { defaultStepLibrary, maintainers }] as const,
    queryFn: () => StepApi.getAlgoliaSteps(defaultStepLibrary, maintainers),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export { useAlgoliaSteps };
