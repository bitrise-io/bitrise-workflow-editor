import { Box, ExpandableCard, Text, Toggle } from '@bitrise/bitkit';
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

  const { updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled, yml } = useBitriseYmlStore((s) => ({
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled:
      s.updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled,
    yml: s.yml,
  }));

  const abortOnFailureEnabled = yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.abort_on_fail ?? false;

  const onAbortOnFailureToggleChange = () => {
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled(pipelineId, workflowId, !abortOnFailureEnabled);
  };

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent pipelineId={pipelineId + workflowId} />}
    >
      <Box display="flex" flexDir="column" gap="24" />

      <Toggle
        variant="fixed"
        label="Abort Pipeline on failure"
        helperText="Running Workflows will shut down, future ones won’t start if this one fails."
        isChecked={abortOnFailureEnabled}
        onChange={() => {
          onAbortOnFailureToggleChange();
        }}
      />
    </ExpandableCard>
  );
};

export default PipelineConditionsCard;
