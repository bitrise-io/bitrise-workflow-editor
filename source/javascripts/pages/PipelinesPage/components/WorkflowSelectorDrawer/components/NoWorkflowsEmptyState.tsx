import { EmptyState } from '@bitrise/bitkit';

const NoWorkflowsEmptyState = () => {
  return (
    <EmptyState
      iconName="WorkflowFlow"
      title="There are no Workflows"
      description="Create Workflows to start building a Pipeline."
    />
  );
};

export default NoWorkflowsEmptyState;
