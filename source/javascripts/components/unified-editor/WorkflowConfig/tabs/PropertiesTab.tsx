import { ChangeEventHandler, useEffect, useState } from 'react';
import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { useDebounceCallback } from 'usehooks-ts';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import useRenameWorkflow from '../hooks/useRenameWorkflow';

type Props = {
  variant: 'panel' | 'drawer';
};

function createValuesFromWorkflow(workflow: ReturnType<typeof useWorkflowConfigContext>) {
  return {
    name: workflow?.id || '',
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
  };
}

const PropertiesTab = ({ variant }: Props) => {
  const workflows = useWorkflows();
  const workflow = useWorkflowConfigContext();
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const wofkflowIds = Object.keys(workflows).filter((id) => id !== workflow?.id);
  const updateWorkflow = useBitriseYmlStore(useShallow((s) => s.updateWorkflow));
  const [{ name, summary, description }, setValues] = useState(createValuesFromWorkflow(workflow));
  const [nameValidationError, setNameValidationError] = useState(WorkflowService.validateName(name, wofkflowIds));

  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    if (variant === 'panel') {
      setSelectedWorkflow(newWorkflowId);
    }
  });

  const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 150);

  const onNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setNameValidationError(true);
    const sanitizedName = WorkflowService.sanitizeName(e.target.value);
    const validationError = WorkflowService.validateName(sanitizedName, wofkflowIds);
    setValues((prev) => ({ ...prev, name: sanitizedName }));

    if (validationError === true) {
      renameWorkflow(sanitizedName);
    } else {
      setNameValidationError(validationError);
    }
  };

  const onSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { summary: e.target.value });
  };

  const onDescrptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { description: e.target.value });
  };

  useEffect(() => {
    setValues(createValuesFromWorkflow(workflow));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  return (
    <Box gap="24" display="flex" flexDir="column">
      <Input
        isRequired
        label="Name"
        value={name}
        onChange={onNameChange}
        inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
        errorText={nameValidationError === true ? '' : nameValidationError}
      />
      <Textarea label="Summary" value={summary} onChange={onSummaryChange} />
      <Textarea label="Description" value={description} onChange={onDescrptionChange} />
    </Box>
  );
};

export default PropertiesTab;
