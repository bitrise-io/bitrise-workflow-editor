import { useEffect } from 'react';
import { Box, Button, EmptyState } from '@bitrise/bitkit';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import StepBundlesCanvasPanel from '@/pages/StepBundlesPage/components/StepBundlesCanvasPanel';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';

const StepBundlesPageContent = () => {
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);
  const stepBundles = useStepBundles();
  const hasStepBundles = Object.keys(stepBundles).length > 0;

  useEffect(() => {
    closeDialog();
  }, [hasStepBundles, closeDialog]);

  if (!hasStepBundles) {
    return (
      <EmptyState
        iconName="Steps"
        title="Your Step bundles will appear here"
        description="With Step bundles, you can create reusable chunks of configuration. You can also create Step bundles in your Workflows."
      >
        <Button
          leftIconName="PlusCircle"
          variant="primary"
          onClick={() =>
            openDialog({
              type: WorkflowsPageDialogType.CREATE_WORKFLOW,
            })
          }
        >
          Create Step bundle
        </Button>
      </EmptyState>
    );
  }

  return (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <StepBundlesCanvasPanel />
    </Box>
  );
};

type StepBundlesPageProps = {
  yml: BitriseYml;
};

const StepBundlesPage = (props: StepBundlesPageProps) => {
  const { yml } = props;
  return (
    <BitriseYmlProvider yml={yml}>
      <StepBundlesPageContent />
    </BitriseYmlProvider>
  );
};

export default StepBundlesPage;
