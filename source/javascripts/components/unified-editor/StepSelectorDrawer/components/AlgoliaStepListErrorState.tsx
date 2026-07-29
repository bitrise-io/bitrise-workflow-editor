import { Notification } from '@bitrise/bitkit';

type Props = {
  onRetryButtonClick?: VoidFunction;
};

const AlgoliaStepListErrorState = ({ onRetryButtonClick }: Props) => {
  return (
    <Notification
      data-clarity-unmask="true"
      status="error"
      action={
        onRetryButtonClick && {
          label: 'Retry',
          placement: 'end',
          onClick: onRetryButtonClick,
        }
      }
    >
      Network error: Failed to fetch steps. Please try again.
    </Notification>
  );
};

export default AlgoliaStepListErrorState;
