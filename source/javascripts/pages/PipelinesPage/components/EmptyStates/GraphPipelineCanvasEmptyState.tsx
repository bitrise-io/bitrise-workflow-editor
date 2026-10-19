import { BitkitButton, BitkitEmptyState, BitkitEmptyStateProps, IconPlus, IconWorkflowFlow } from '@bitrise/bitkit-v2';

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
        <BitkitButton size="md" icon={IconPlus} onClick={onAddWorkflow}>
          Add Workflow
        </BitkitButton>
      )}
    </BitkitEmptyState>
  );
};

export default GraphPipelineCanvasEmptyState;
