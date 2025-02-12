import { ChangeEventHandler } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Divider, ExpandableCard, Input, Select, Text, Textarea, Toggle } from '@bitrise/bitkit';

import useFeatureFlag from '@/hooks/useFeatureFlag';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import DetailedHelperText from '@/components/DetailedHelperText';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

const PipelineConditionsCard = () => {
  const enableParallelWorkflow = useFeatureFlag('enable-wfe-parallel-workflow');

  return (
    <ExpandableCard padding="24px" buttonPadding="16px 24px" buttonContent={<ButtonContent />}>
      <AbortOnFailToggle />

      <Divider my="24" />
      <AlwaysRunSelect />

      <Divider my="24" />
      <RunIfInput />

      {enableParallelWorkflow && (
        <>
          <Divider my="24" />
          <ParallelInput />
        </>
      )}
    </ExpandableCard>
  );
};

const ButtonContent = () => {
  const pipelineId = usePipelinesPageStore((s) => s.pipelineId);

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

const AbortOnFailToggle = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));

  const isChecked = useBitriseYmlStore(
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.abort_on_fail ?? false,
  );

  const updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled = useBitriseYmlStore(
    (s) => s.updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled,
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled(pipelineId, workflowId, e.target.checked);
  };

  return (
    <Toggle
      isChecked={isChecked}
      variant="fixed"
      label="Abort Pipeline on failure"
      helperText="Running Workflows will shut down, future ones won’t start if this one fails."
      onChange={handleChange}
    />
  );
};

const AlwaysRunSelect = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));

  const options = [
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

  const value = useBitriseYmlStore(
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.should_always_run ?? 'off',
  );

  const helperText = options.find((o) => o.value === value)?.helperText;

  const updatePipelineWorkflowConditionShouldAlwaysRun = useBitriseYmlStore(
    (s) => s.updatePipelineWorkflowConditionShouldAlwaysRun,
  );

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    updatePipelineWorkflowConditionShouldAlwaysRun(pipelineId, workflowId, e.target.value);
  };

  return (
    <Select isRequired label="Always run" value={value} helperText={helperText} onChange={handleChange}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
};

const RunIfInput = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));

  const value = useBitriseYmlStore(
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.run_if?.expression ?? '',
  );

  const updatePipelineWorkflowConditionRunIfExpression = useBitriseYmlStore(
    (s) => s.updatePipelineWorkflowConditionRunIfExpression,
  );

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    updatePipelineWorkflowConditionRunIfExpression(pipelineId, workflowId, e.target.value);
  };

  return (
    <Textarea
      value={value}
      label="Additional running conditions"
      placeholder="Enter any valid Go template"
      helperText="Enter any valid Go template. The workflow will only be executed if this template evaluates to true. You can use our `getenv` and `enveq` functions for interacting with env vars."
      onChange={handleChange}
    />
  );
};

const ParallelInput = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));
  const value = useBitriseYmlStore((s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.parallel);
  const updatePipelineWorkflowParallel = useBitriseYmlStore((s) => s.updatePipelineWorkflowParallel);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    updatePipelineWorkflowParallel(pipelineId, workflowId, e.target.value);
  };

  return (
    <Input
      value={value}
      type="number"
      label="Parallel copies"
      helperText={
        <DetailedHelperText
          summary="The number of copies of this Workflow that will be executed in parallel at runtime."
          details="Example test splitting: Split your tests into `$BITRISE_IO_PARALLEL_TOTAL` parts, and in each parallel copies, run only the part matching `$BITRISE_IO_PARALLEL_INDEX`"
        />
      }
      onChange={handleChange}
    />
  );
};

export default PipelineConditionsCard;
