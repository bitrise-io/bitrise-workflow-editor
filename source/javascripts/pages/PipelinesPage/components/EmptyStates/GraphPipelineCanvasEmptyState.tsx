import { Button, EmptyState, EmptyStateProps } from '@bitrise/bitkit';

import { useIsReadOnlyView } from '@/hooks/useTree';

type Props = Omit<EmptyStateProps, 'title'> & {
  onAddWorkflow: VoidFunction;
};

const GraphPipelineCanvasEmptyState = ({ onAddWorkflow, ...props }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();

  return (
    <EmptyState
      {...props}
      iconName="WorkflowFlow"
      title="Welcome to the Pipeline canvas"
      description="Start building your graph by adding Workflow nodes to the canvas."
    >
      {/* Read-only views (merged config, cross-repo/ref files) can't add workflows — show no CTA. */}
      {!isReadOnlyView && (
        <Button size="md" leftIconName="Plus" onClick={onAddWorkflow}>
          Add Workflow
        </Button>
      )}
    </EmptyState>
  );
};

export default GraphPipelineCanvasEmptyState;
