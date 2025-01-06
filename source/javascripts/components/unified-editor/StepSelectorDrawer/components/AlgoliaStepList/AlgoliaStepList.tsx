import { SelectStepHandlerFn } from '../../StepSelectorDrawer.types';

import useSearchAlgoliaSteps from './hooks/useSearchAlgoliaSteps';
import AlgoliaStepListLoadingState from './components/AlgoliaStepListLoadingState';
import AlgoliaStepListErrorState from './components/AlgoliaStepListErrorState';
import AlgoliaStepListEmptyState from './components/AlgoliaStepListEmptyState';
import AlgoliaStepListItems from './components/AlgoliaStepListItems';

type Props = {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const AlgoliaStepList = ({ enabledSteps, onSelectStep }: Props) => {
  const { data: steps = [], isFetching, isError, refetch } = useSearchAlgoliaSteps();

  if (isFetching) {
    return <AlgoliaStepListLoadingState />;
  }

  if (isError) {
    return <AlgoliaStepListErrorState onRetryButtonClick={refetch} />;
  }

  if (steps.length === 0) {
    return <AlgoliaStepListEmptyState />;
  }

  return <AlgoliaStepListItems steps={steps} enabledSteps={enabledSteps} onSelectStep={onSelectStep} />;
};

export default AlgoliaStepList;
