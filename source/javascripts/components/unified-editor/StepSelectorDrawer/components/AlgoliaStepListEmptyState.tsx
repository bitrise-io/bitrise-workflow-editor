import { Button } from '@bitrise/bitkit';
import { BitkitEmptyState, IconMagnifier } from '@bitrise/bitkit-v2';

import useSearch from '../hooks/useSearch';

const AlgoliaStepListEmptyState = () => {
  const resetSearch = useSearch((s) => s.reset);

  return (
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconMagnifier}
      headingText="No Steps are matching your filter"
      bodyText="Modify your filters to get results."
    >
      <Button variant="secondary" onClick={resetSearch}>
        Clear filters
      </Button>
    </BitkitEmptyState>
  );
};

export default AlgoliaStepListEmptyState;
