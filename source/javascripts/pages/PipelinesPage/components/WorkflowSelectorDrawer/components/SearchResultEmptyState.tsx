import { Button } from '@bitrise/bitkit';
import { BitkitEmptyState, IconMagnifier } from '@bitrise/bitkit-v2';

type Props = {
  onClickButton?: VoidFunction;
};

const SearchResultEmptyState = ({ onClickButton }: Props) => {
  return (
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconMagnifier}
      headingText="No Workflows are matching your filter"
      bodyText="Modify your filters to get results."
    >
      <Button size="md" variant="secondary" onClick={onClickButton}>
        Clear filters
      </Button>
    </BitkitEmptyState>
  );
};

export default SearchResultEmptyState;
