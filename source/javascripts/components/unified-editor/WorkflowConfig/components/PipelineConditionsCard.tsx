import { Box, Divider, ExpandableCard, Input, Select, Text, Textarea, Toggle } from '@bitrise/bitkit';
import { uniq } from 'es-toolkit';
import { ChangeEventHandler, useState } from 'react';

import DetailedHelperText from '@/components/DetailedHelperText';
import { EnvVarPopover } from '@/components/VariablePopover';
import GraphPipelineWorkflowService from '@/core/services/GraphPipelineWorkflowService';
import PipelineService from '@/core/services/PipelineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

type PipelineConditionInputProps = {
  pipelineId: string;
  workflowId: string;
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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    PipelineService.updatePipelineWorkflowField(pipelineId, workflowId, 'abort_on_fail', e.target.checked);
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
      value: '',
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
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.should_always_run ?? '',
  );

  const helperText = options.find((o) => o.value === value)?.helperText;

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    PipelineService.updatePipelineWorkflowField(
      pipelineId,
      workflowId,
      'should_always_run',
      e.target.value === 'workflow' ? 'workflow' : undefined,
    );
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

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    PipelineService.updatePipelineWorkflowField(pipelineId, workflowId, 'run_if.expression', e.target.value);
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
  const initValue = useBitriseYmlStore((s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.parallel || '');

  const existingWorkflowIds = useBitriseYmlStore((s) => {
    return uniq([
      ...Object.keys(s.yml.workflows ?? {}),
      ...Object.keys(s.yml.pipelines?.[pipelineId]?.workflows ?? {}),
    ]);
  });

  const [value, setValue] = useState(initValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const validateAndPersist = (parallel: string | number) => {
    const stringValue = String(parallel);
    const validationError = GraphPipelineWorkflowService.validateParallel(stringValue, workflowId, existingWorkflowIds);

    setError(validationError === true ? undefined : validationError);

    if (validationError === true) {
      PipelineService.updatePipelineWorkflowField(pipelineId, workflowId, 'parallel', stringValue);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
    validateAndPersist(e.target.value);
  };

  const insertVariable = (key: string) => {
    setValue(`$${key}`);
    validateAndPersist(`$${key}`);
  };

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

export default PipelineConditionsCard;
