import { Button } from '@bitrise/bitkit';
import { BitkitEmptyState, BitkitEmptyStateProps, IconWorkflowFlow } from '@bitrise/bitkit-v2';

import { useIsReadOnlyView } from '@/hooks/useTree';

type Props = Omit<BitkitEmptyStateProps, 'bodyText' | 'headingText' | 'icon'> & {
  onAddWorkflow: VoidFunction;
};

const GraphPipelineCanvasEmptyState = ({ onAddWorkflow, ...props }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();

  return (
    <BitkitEmptyState
      {...props}
      data-clarity-unmask="true"
      icon={IconWorkflowFlow}
      headingText="Welcome to the Pipeline canvas"
      bodyText="Start building your graph by adding Workflow nodes to the canvas."
    >
      {/* Read-only views (merged config, cross-repo/ref files) can't add workflows — show no CTA. */}
      {!isReadOnlyView && (
        <Button size="md" leftIconName="Plus" onClick={onAddWorkflow}>
          Add Workflow
        </Button>
      )}
    </BitkitEmptyState>
  );
};

export default GraphPipelineCanvasEmptyState;
