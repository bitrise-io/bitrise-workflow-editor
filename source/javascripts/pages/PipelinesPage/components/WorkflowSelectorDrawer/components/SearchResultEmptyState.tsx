import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onClickButton?: VoidFunction;
};

const SearchResultEmptyState = ({ onClickButton }: Props) => {
  return (
    <EmptyState
      iconName="Magnifier"
      title="No Workflows are matching your filter"
      description="Modify your filters to get results."
    >
      <Button size="md" variant="secondary" onClick={onClickButton}>
        Clear filters
      </Button>
    </EmptyState>
  );
};

export default SearchResultEmptyState;
