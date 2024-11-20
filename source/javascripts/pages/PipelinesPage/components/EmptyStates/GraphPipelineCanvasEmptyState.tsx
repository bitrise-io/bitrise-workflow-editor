import { Button, EmptyState, EmptyStateProps } from '@bitrise/bitkit';

type Props = Omit<EmptyStateProps, 'title'> & {
  onAddWorkflow: VoidFunction;
};

const GraphPipelineCanvasEmptyState = ({ onAddWorkflow, ...props }: Props) => {
  return (
    <EmptyState
      {...props}
      iconName="WorkflowFlow"
      title="Welcome to the Pipeline canvas"
      description="Start building your graph by adding Workflow nodes to the canvas."
    >
      <Button size="md" leftIconName="Plus" onClick={onAddWorkflow}>
        Add Workflow
      </Button>
    </EmptyState>
  );
};

export default GraphPipelineCanvasEmptyState;
