import {
  BitkitExpandableCard,
  BitkitNativeSelect,
  BitkitSwitch,
  BitkitTextArea,
  BitkitTextInput,
} from '@bitrise/bitkit-v2';
import { Separator } from '@chakra-ui/react/separator';
import { Text } from '@chakra-ui/react/text';
import { uniq } from 'es-toolkit';
import { ChangeEventHandler, useState } from 'react';

import DetailedHelperText from '@/components/DetailedHelperText';
import { EnvVarPopover } from '@/components/VariablePopover';
import PipelineService from '@/core/services/PipelineService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';

type PipelineConditionInputProps = {
  pipelineId: string;
  workflowId: string;
};

const AbortOnFailToggle = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
  const isChecked = useBitriseYmlStore(
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.abort_on_fail ?? false,
  );

  const handleChange = ({ checked }: { checked: boolean }) => {
    PipelineService.updatePipelineWorkflowField(pipelineId, workflowId, 'abort_on_fail', checked);
  };

  return (
    <BitkitSwitch
      checked={isChecked}
      variant="fixed"
      size="md"
      label="Abort Pipeline on failure"
      helperText="Running Workflows will shut down, future ones won’t start if this one fails."
      onCheckedChange={handleChange}
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
    <BitkitNativeSelect size="md" label="Always run" value={value} helperText={helperText} onChange={handleChange}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </BitkitNativeSelect>
  );
};

const RunIfInput = ({ pipelineId, workflowId }: PipelineConditionInputProps) => {
  const value = useBitriseYmlStore(
    (s) => s.yml.pipelines?.[pipelineId]?.workflows?.[workflowId]?.run_if?.expression ?? '',
  );

  const handleValueChange = (newValue: string) => {
    PipelineService.updatePipelineWorkflowField(pipelineId, workflowId, 'run_if.expression', newValue);
  };

  return (
    <BitkitTextArea
      optional
      value={value}
      label="Additional running conditions"
      size="md"
      placeholder="Enter any valid Go template"
      helperText="Enter any valid Go template. The workflow will only be executed if this template evaluates to true. You can use our `getenv` and `enveq` functions for interacting with env vars."
      onValueChange={handleValueChange}
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

  const [value, setValue] = useState(String(initValue));
  const [error, setError] = useState<string | undefined>(undefined);

  const validateAndPersist = (parallel: string | number) => {
    const stringValue = String(parallel);
    const validationError = PipelineService.validateParallel(stringValue, workflowId, existingWorkflowIds);

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
    <BitkitTextInput
      optional
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
      endElement={<EnvVarPopover size="sm" onSelect={({ key }) => insertVariable(key)} />}
    />
  );
};

const PipelineConditionsCard = () => {
  const [pipelineId, workflowId] = usePipelinesPageStore(useShallow((s) => [s.pipelineId, s.workflowId]));

  return (
    <BitkitExpandableCard
      elevation={false}
      subtitle={
        <Text as="span" display="block" truncate>
          Running conditions related to {pipelineId}
        </Text>
      }
      title="Pipeline Conditions"
    >
      <AbortOnFailToggle pipelineId={pipelineId} workflowId={workflowId} />

      <Separator marginBlock="24" />
      <AlwaysRunSelect pipelineId={pipelineId} workflowId={workflowId} />

      <Separator marginBlock="24" />
      <RunIfInput pipelineId={pipelineId} workflowId={workflowId} />

      <Separator marginBlock="24" />
      <ParallelInput pipelineId={pipelineId} workflowId={workflowId} />
    </BitkitExpandableCard>
  );
};

export default PipelineConditionsCard;
