import { Box, Card, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { usePipelinesPageStore } from '../../../../pages/PipelinesPage/PipelinesPage.store';

type ButtonContentProps = {
  pipelineId: string;
};

const ButtonContent = ({ pipelineId }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" minW={0}>
      <Box display="flex" flexDir="column" alignItems="flex-start" minW={0}>
        <Text textStyle="body/lg/semibold">Pipeline Conditions</Text>
        <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
          Running conditions related to {pipelineId}
        </Text>
      </Box>
    </Box>
  );
};

const PipelineConditionsCard = () => {
  const { pipelineId, workflowId } = usePipelinesPageStore();

  const { updateWorkflowAbortPipelineOnFailure, yml } = useBitriseYmlStore((s) => ({
    updateWorkflowTriggersEnabled: s.updateWorkflowTriggersEnabled,
    yml: s.yml,
  }));

  const onAbortOnFailureToggleChange = () => {
    updateWorkflowTriggersEnabled(workflow?.id || '', triggers.enabled === false);
  };

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent pipelineId={pipelineId + workflowId} />}
    >
      <Box display="flex" flexDir="column" gap="24" />

      <Card paddingY="16" paddingX="24" marginBlockEnd="24" variant="outline">
        <Toggle
          variant="fixed"
          label="Enable triggers"
          helperText="When disabled and saved, none of the triggers below will execute a build."
          isChecked={triggers.enabled !== false}
          onChange={() => {
            onToggleChange();
          }}
        />
      </Card>
    </ExpandableCard>
  );
};

export default PipelineConditionsCard;
