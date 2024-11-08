import { ChangeEventHandler } from 'react';
import { Box, Textarea, Divider, ExpandableCard, Select, Text, Toggle } from '@bitrise/bitkit';
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

const shouldAlwaysRunOptions = [
  {
    value: 'off',
    label: 'Off',
    helperText: 'This Workflow or its dependent Workflows won’t start if previous Workflows failed.',
  },
  {
    value: 'workflow',
    label: 'Workflow',
    helperText: 'This Workflow will start if previous Workflows failed.',
  },
];

const PipelineConditionsCard = () => {
  const { pipelineId, workflowId } = usePipelinesPageStore();

  const {
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled,
    updatePipelineWorkflowConditionShouldAlwaysRun,
    updatePipelineWorkflowConditionRunIfExpression,
    abortOnFailureEnabled,
    shouldAlwaysRunValue,
    runIfExpression,
  } = useBitriseYmlStore((s) => ({
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled:
      s.updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled,
    updatePipelineWorkflowConditionShouldAlwaysRun: s.updatePipelineWorkflowConditionShouldAlwaysRun,
    updatePipelineWorkflowConditionRunIfExpression: s.updatePipelineWorkflowConditionRunIfExpression,
    abortOnFailureEnabled: s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.abort_on_fail ?? false,
    shouldAlwaysRunValue: s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.should_always_run ?? 'off',
    runIfExpression: s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.run_if?.expression ?? '',
  }));

  const onAbortOnFailureToggleChange = () => {
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled(pipelineId, workflowId, !abortOnFailureEnabled);
  };

  const shouldAlwaysRunHelperText = shouldAlwaysRunOptions.find(
    (option) => option.value === shouldAlwaysRunValue,
  )?.helperText;
  const onShouldAlwaysRunChange = (value: string) => {
    updatePipelineWorkflowConditionShouldAlwaysRun(pipelineId, workflowId, value);
  };

  const onRunIfExpressionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    updatePipelineWorkflowConditionRunIfExpression(pipelineId, workflowId, e.target.value);
  };

  return (
    <ExpandableCard padding="24px" buttonPadding="16px 24px" buttonContent={<ButtonContent pipelineId={pipelineId} />}>
      <Box display="flex" flexDir="column" gap="24" />

      <Toggle
        variant="fixed"
        label="Abort Pipeline on failure"
        helperText="Running Workflows will shut down, future ones won’t start if this one fails."
        isChecked={abortOnFailureEnabled}
        onChange={onAbortOnFailureToggleChange}
      />

      <Divider my="24" />

      <Select
        isRequired
        label="Always run"
        value={shouldAlwaysRunValue}
        helperText={shouldAlwaysRunHelperText}
        onChange={(e) => onShouldAlwaysRunChange(e.target.value)}
      >
        {shouldAlwaysRunOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Divider my="24" />

      <Textarea
        label="Additional running conditions"
        placeholder="Enter any valid Go template"
        value={runIfExpression}
        helperText='You can use e.g. "getenv": createGetEnvForEnvVars(envs), "enveq": createEnvEqForEnvVars(envs)'
        onChange={onRunIfExpressionChange}
      />
    </ExpandableCard>
  );
};

export default PipelineConditionsCard;
