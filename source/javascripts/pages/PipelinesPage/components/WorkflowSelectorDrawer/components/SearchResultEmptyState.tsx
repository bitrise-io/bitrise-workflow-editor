import { BitkitButton, BitkitEmptyState, IconMagnifier } from '@bitrise/bitkit-v2';

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
      <BitkitButton size="md" variant="secondary" onClick={onClickButton}>
        Clear filters
      </BitkitButton>
    </BitkitEmptyState>
  );
};

export default SearchResultEmptyState;
