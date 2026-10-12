import { BitkitEmptyState, IconWorkflowFlow } from '@bitrise/bitkit-v2';

const NoWorkflowsEmptyState = () => {
  return (
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconWorkflowFlow}
      headingText="There are no available Workflows"
      bodyText="Create Workflows to start building a Pipeline."
    />
  );
};

export default NoWorkflowsEmptyState;
