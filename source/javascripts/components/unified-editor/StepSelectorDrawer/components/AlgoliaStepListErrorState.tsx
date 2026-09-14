import { BitkitAlert } from '@bitrise/bitkit-v2';

type Props = {
  onRetryButtonClick?: VoidFunction;
};

const AlgoliaStepListErrorState = ({ onRetryButtonClick }: Props) => {
  return (
    <BitkitAlert
      data-clarity-unmask="true"
      variant="critical"
      action={
        onRetryButtonClick && {
          label: 'Retry',
          onClick: onRetryButtonClick,
        }
      }
      messageText="Network error: Failed to fetch steps. Please try again."
    />
  );
};

export default AlgoliaStepListErrorState;
