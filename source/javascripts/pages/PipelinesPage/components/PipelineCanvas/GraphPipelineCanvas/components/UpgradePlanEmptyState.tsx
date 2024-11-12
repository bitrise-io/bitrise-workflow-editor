import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onUpgrade?: VoidFunction;
};
const UpgradePlanEmptyState = ({ onUpgrade }: Props) => {
  return (
    <EmptyState
      flex="1"
      iconName="WorkflowFlow"
      title="Upgrade your plan to use Pipelines"
      description="Experience enhanced automation and faster builds. Upgrade your plan to create Pipelines using a visual editor."
    >
      {onUpgrade && (
        <Button size="md" onClick={onUpgrade}>
          Upgrade plan
        </Button>
      )}
    </EmptyState>
  );
};

export default UpgradePlanEmptyState;
