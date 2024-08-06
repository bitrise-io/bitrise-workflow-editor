import { useQuery } from '@tanstack/react-query';
import { Paths } from 'type-fest';
import sortBy from 'lodash/sortBy';
import { Step, StepInputOptions } from '@/models/Step';
import useAlgolia from './useAlgolia';

type AlgoliaStepInputsResponse = Partial<{
  readonly objectID: string;
  cvs: string;
  order: number;
  opts: StepInputOptions;
  is_latest: boolean;
  [key: string]: unknown;
}>;

type UseStepInputsProps = {
  cvs: string;
  enabled?: boolean;
  attributesToRetrieve?: Paths<AlgoliaStepInputsResponse>[] | ['*'];
};

const useAlgoliaStepInputs = ({ cvs, attributesToRetrieve = ['*'], enabled = true }: UseStepInputsProps) => {
  const { algoliaInputsClient } = useAlgolia();

  return useQuery({
    queryKey: ['algolia-step-inputs', cvs, attributesToRetrieve] as const,
    queryFn: async () => {
      const results: Array<AlgoliaStepInputsResponse> = [];

      await algoliaInputsClient.browseObjects<AlgoliaStepInputsResponse>({
        attributesToRetrieve,
        filters: `cvs:${cvs}`,
        batch: (batch) => results.push(...batch),
      });

      return sortBy(results, 'order').map(({ opts, cvs: _, is_latest, objectID, order, ...input }) => {
        return { opts, ...input };
      }) as Exclude<Step['inputs'], undefined>;
    },
    enabled: Boolean(algoliaInputsClient && enabled),
    staleTime: Infinity,
  });
};

export default useAlgoliaStepInputs;
