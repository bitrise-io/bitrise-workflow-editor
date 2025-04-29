import { Box, Divider, ExpandableCard, Input, Select, Text, Textarea, Toggle } from '@bitrise/bitkit';
import { uniq } from 'es-toolkit';
import { ChangeEventHandler, useEffect, useState } from 'react';

import DetailedHelperText from '@/components/DetailedHelperText';
import { EnvVarPopover } from '@/components/VariablePopover';
import GraphPipelineWorkflowService from '@/core/services/GraphPipelineWorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

type PipelineConditionInputProps = {
  pipelineId: string;
  workflowId: string;
};

const PipelineConditionsCard = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));

  return (
    <ExpandableCard padding="24px" buttonPadding="16px 24px" buttonContent={<ButtonContent />}>
      <AbortOnFailToggle pipelineId={pipelineId} workflowId={workflowId} />

      <Divider my="24" />
      <AlwaysRunSelect pipelineId={pipelineId} workflowId={workflowId} />

      <Divider my="24" />
      <RunIfInput pipelineId={pipelineId} workflowId={workflowId} />

      <Divider my="24" />
      <ParallelInput pipelineId={pipelineId} workflowId={workflowId} />
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

const AbortOnFailToggle = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
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

const AlwaysRunSelect = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
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
    <Select size="md" isRequired label="Always run" value={value} helperText={helperText} onChange={handleChange}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
};

const RunIfInput = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
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

const ParallelInput = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
  const updatePipelineWorkflowParallel = useBitriseYmlStore((s) => s.updatePipelineWorkflowParallel);
  const initValue = useBitriseYmlStore((s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.parallel || '');

  const existingWorkflowIds = useBitriseYmlStore((s) => {
    return uniq([
      ...Object.keys(s.yml.workflows ?? {}),
      ...Object.keys(s.yml.pipelines?.[pipelineId]?.workflows ?? {}),
    ]);
  });

  const [value, setValue] = useState(initValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  const insertVariable = (key: string) => {
    setValue(`$${key}`);
  };

  useEffect(() => {
    const stringValue = String(value);
    const validationError = GraphPipelineWorkflowService.validateParallel(stringValue, workflowId, existingWorkflowIds);

    setError(validationError === true ? undefined : validationError);

    if (validationError === true) {
      updatePipelineWorkflowParallel(pipelineId, workflowId, stringValue);
    }
  }, [value, pipelineId, workflowId, existingWorkflowIds, updatePipelineWorkflowParallel]);

  return (
    <Input
      size="md"
      value={value}
      errorText={error}
      label="Parallel copies"
      helperText={
        <DetailedHelperText
          summary="The number of copies of this Workflow that will be executed in parallel at runtime. Value can be a number, or an Env Var."
          details="For example, entering 4 means that 4 identical copies of the Workflow will execute in parallel. Env Vars called `$BITRISE_IO_PARALLEL_TOTAL` and `$BITRISE_IO_PARALLEL_INDEX` are available to help distinguish between copies."
        />
      }
      onChange={handleChange}
      rightAddon={
        <Box paddingRight="4">
          <EnvVarPopover size="sm" onSelect={({ key }) => insertVariable(key)} />
        </Box>
      }
      rightAddonPlacement="inside"
    />
  );
};

export default PipelineConditionsCard;
