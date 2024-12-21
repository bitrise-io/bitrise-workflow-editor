import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onCreateStepBundle: () => void;
};

const StepBundleEmptyState = ({ onCreateStepBundle }: Props) => {
  return (
    <EmptyState
      iconName="Steps"
      title="Your Step bundles will appear here"
      description="With Step bundles, you can create reusable chunks of configuration. You can also create Step bundles in your Workflows."
    >
      <Button leftIconName="PlusCircle" onClick={onCreateStepBundle}>
        Create Step bundle
      </Button>
    </EmptyState>
  );
};

export default StepBundleEmptyState;
