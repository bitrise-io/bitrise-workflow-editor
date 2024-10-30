import { Button, EmptyState } from '@bitrise/bitkit';

type Props = {
  onAddWorkflow: VoidFunction;
};

const GraphPipelineCanvasEmptyState = ({ onAddWorkflow }: Props) => {
  return (
    <EmptyState
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
