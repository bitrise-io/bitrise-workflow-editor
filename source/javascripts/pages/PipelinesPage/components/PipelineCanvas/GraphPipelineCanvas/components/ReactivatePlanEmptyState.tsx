import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onReactivate?: VoidFunction;
};

const ReactivatePlanEmptyState = ({ onReactivate }: Props) => {
  return (
    <EmptyState
      flex="1"
      iconName="WorkflowFlow"
      title="Reactivate your Pipelines"
      description="Your pipelines are not lost. Upgrade your plan to make them available again and continue utilizing enhanced automation for faster builds."
    >
      {onReactivate && (
        <Button size="md" onClick={onReactivate}>
          Upgrade plan
        </Button>
      )}
    </EmptyState>
  );
};

export default ReactivatePlanEmptyState;
