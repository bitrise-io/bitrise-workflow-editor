import { BitkitButton, IconPlus } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import { useIsReadOnlyView } from '@/hooks/useTree';
import usePipelineSelector from '@/pages/PipelinesPage/hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

import { OPENS_WORKFLOW_SELECTOR } from '../../../WorkflowSelectorDrawer/WorkflowSelectorDrawer';
import { WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';

// Adding a Workflow happens where the Workflows are: under the ones that run first.
const AddWorkflowNode = () => {
  const { selectedPipeline } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  // Adding is a mutation, so the read-only merged and cross-repo views get no button.
  const isReadOnlyView = useIsReadOnlyView();

  if (isReadOnlyView) {
    return null;
  }

  return (
    <Box width={WORKFLOW_NODE_WIDTH} paddingInline="16">
      {/* Inset 16px each side from the Workflow nodes it adds to. */}
      <BitkitButton
        className="nodrag nopan"
        {...{ [OPENS_WORKFLOW_SELECTOR]: true }}
        width="100%"
        size="md"
        variant="tertiary"
        icon={IconPlus}
        onClick={openDialog({ type: PipelinesPageDialogType.WORKFLOW_SELECTOR, pipelineId: selectedPipeline })}
      >
        Workflow
      </BitkitButton>
    </Box>
  );
};

export default AddWorkflowNode;
