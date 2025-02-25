import { Button, EmptyState } from '@bitrise/bitkit';

const StepBundleConfigurationTab = () => {
  return (
    <EmptyState
      title="Bundle inputs"
      description="Define input variables to manage multiple Steps within a bundle. Reference their keys in Steps and assign custom
      values for each Workflow."
      p={48}
    >
      <Button leftIconName="Plus" variant="secondary" size="md" mt={24}>
        Add input
      </Button>
    </EmptyState>
  );
};

export default StepBundleConfigurationTab;
