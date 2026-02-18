import { useMemo } from 'react';

import AlgoliaApi from '@/core/api/AlgoliaApi';
import { Maintainer } from '@/core/models/Step';
import PageProps from '@/core/utils/PageProps';

import useSearchAlgoliaSteps from '../hooks/useSearchAlgoliaSteps';
import { SelectStepHandlerFn } from '../StepSelectorDrawer.types';
import AlgoliaStepListEmptyState from './AlgoliaStepListEmptyState';
import AlgoliaStepListErrorState from './AlgoliaStepListErrorState';
import AlgoliaStepListItems from './AlgoliaStepListItems';
import AlgoliaStepListLoadingState from './AlgoliaStepListLoadingState';

type Props = {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const AlgoliaStepList = ({ enabledSteps, onSelectStep }: Props) => {
  const allowNonBitriseSteps = PageProps.limits()?.allowNonBitriseSteps ?? true;

  const maintainersFilter = useMemo(() => {
    return allowNonBitriseSteps ? undefined : [Maintainer.Bitrise];
  }, [allowNonBitriseSteps]);

  const { data, isFetching, isError, refetch } = useSearchAlgoliaSteps(maintainersFilter);
  const steps = data?.hits ?? [];

  if (isFetching) {
    return <AlgoliaStepListLoadingState />;
  }

  if (isError) {
    return <AlgoliaStepListErrorState onRetryButtonClick={refetch} />;
  }

  if (steps.length === 0) {
    return <AlgoliaStepListEmptyState />;
  }

  return (
    <AlgoliaStepListItems
      steps={steps}
      enabledSteps={enabledSteps}
      onSelectStep={(cvs, algoliaObjectID, position) => {
        onSelectStep(cvs);

        if (data?.queryID) {
          AlgoliaApi.trackStepSelected(data.queryID, algoliaObjectID, position);
        }
      }}
    />
  );
};

export default AlgoliaStepList;
