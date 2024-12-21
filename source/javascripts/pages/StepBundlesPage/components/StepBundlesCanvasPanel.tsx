import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import StepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleCard';
import { WorkflowCardContextProvider } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import StepBundlesSelector from '@/pages/StepBundlesPage/components/StepBundlesSelector';

type Props = {
  stepBundleId: string;
};

const StepBundlesCanvasPanel = ({ stepBundleId }: Props) => {
  return (
    <ReactFlowProvider>
      <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
        <Box
          p="12"
          display="flex"
          gap="12"
          bg="background/primary"
          borderBottom="1px solid"
          borderColor="border/regular"
        >
          <StepBundlesSelector />
        </Box>
        <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
          <WorkflowCardContextProvider>
            <StepBundleCard uniqueId="" stepIndex={-1} cvs={`bundle::${stepBundleId}`} />
          </WorkflowCardContextProvider>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
};

export default StepBundlesCanvasPanel;
