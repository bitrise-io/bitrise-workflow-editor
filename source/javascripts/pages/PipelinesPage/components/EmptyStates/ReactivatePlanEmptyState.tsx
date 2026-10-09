import { Button } from '@bitrise/bitkit';
import { BitkitEmptyState, IconWorkflowFlow } from '@bitrise/bitkit-v2';

type Props = {
  onReactivate?: VoidFunction;
};

const ReactivatePlanEmptyState = ({ onReactivate }: Props) => {
  return (
    <BitkitEmptyState
      flex="1"
      data-clarity-unmask="true"
      icon={IconWorkflowFlow}
      headingText="Reactivate your Pipelines"
      bodyText="Your pipelines are not lost. Upgrade your plan to make them available again and continue utilizing enhanced automation for faster builds."
    >
      {onReactivate && (
        <Button size="md" onClick={onReactivate}>
          Upgrade plan
        </Button>
      )}
    </BitkitEmptyState>
  );
};

export default ReactivatePlanEmptyState;
