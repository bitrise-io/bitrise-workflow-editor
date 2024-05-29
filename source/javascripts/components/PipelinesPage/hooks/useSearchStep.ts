import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Paths } from 'type-fest';
import { Step } from '../PipelinesPage.types';
import useAlgolia from './useAlgolia';

type AlgoliaStepData = Partial<{
  readonly objectID: string;
  cvs: string;
  id: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<Step>;
  info: {
    maintainer?: string;
    asset_urls?: Step['asset_urls'] & {
      'icon.svg'?: string;
      'icon.png'?: string;
    };
  };
}>;

type Props = {
  id: string;
  enabled?: boolean;
  latestOnly?: boolean;
  attributesToRetrieve?: Paths<AlgoliaStepData>[] | ['*'];
};

const useSearchStep = ({
  id,
  enabled,
  latestOnly,
  attributesToRetrieve,
}: Props): UseQueryResult<Array<AlgoliaStepData>> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery({
    enabled,
    queryKey: [id, latestOnly, attributesToRetrieve] as const,
    queryFn: async ({ queryKey: [_id, _latestOnly, _attributesToRetrieve = ['*']] }) => {
      const results: Array<AlgoliaStepData> = [];

      await algoliaStepsClient.browseObjects<AlgoliaStepData>({
        batch: (batch) => results.push(...batch),
        attributesToRetrieve: _attributesToRetrieve,
        filters: _latestOnly ? `id:${_id} AND is_latest:true` : `id:${_id}`,
      });

      return results;
    },
  });
};

export default useSearchStep;
