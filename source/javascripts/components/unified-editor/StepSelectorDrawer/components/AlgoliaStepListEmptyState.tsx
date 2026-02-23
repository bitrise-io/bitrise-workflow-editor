import { Button, EmptyState } from '@bitrise/bitkit';

import PageProps from '@/core/utils/PageProps';

import useSearch from '../hooks/useSearch';

const AlgoliaStepListEmptyState = () => {
  const setSearchStep = useSearch((s) => s.setSearchStep);
  const setSearchStepCategories = useSearch((s) => s.setSearchStepCategories);
  const setSearchStepMaintainers = useSearch((s) => s.setSearchStepMaintainers);

  const handleClearButtonClick = () => {
    setSearchStep('');
    setSearchStepCategories([]);
    setSearchStepMaintainers(PageProps.getInitialStepMaintainers());
  };

  return (
    <EmptyState
      padding="48"
      iconName="Magnifier"
      title="No Steps are matching your filter"
      description="Modify your filters to get results."
    >
      <Button variant="secondary" onClick={handleClearButtonClick}>
        Clear filters
      </Button>
    </EmptyState>
  );
};

export default AlgoliaStepListEmptyState;
