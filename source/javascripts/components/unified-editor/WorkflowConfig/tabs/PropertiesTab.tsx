import { ChangeEventHandler, useEffect, useState } from 'react';
import { Box, Input, Textarea } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/models/WorkflowService';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store'; // NOTE: this should be in a different folder
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import useRenameWorkflow from '../hooks/useRenameWorkflow';

type Props = {
  variant: 'panel' | 'drawer';
};

const NameInput = ({ variant }: Props) => {
  const workflow = useWorkflowConfigContext();
  const workflowNames = Object.keys(useWorkflows()).filter((id) => id !== workflow?.id);
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const { openWorkflowConfigDrawer } = useWorkflowsPageStore();

  const [value, setValue] = useState(workflow?.id || '');
  const [error, setError] = useState(WorkflowService.validateName(workflow?.id || '', workflowNames));

  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    if (variant === 'panel') {
      setSelectedWorkflow(newWorkflowId);
    }

    if (variant === 'drawer') {
      openWorkflowConfigDrawer(newWorkflowId);
    }
  });

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(() => {
      const sanitized = WorkflowService.sanitizeName(e.target.value);
      const validationError = WorkflowService.validateName(sanitized, workflowNames);

      if (validationError === true) {
        renameWorkflow(sanitized);
      } else {
        setError(validationError);
      }

      return sanitized;
    });
  };

  useEffect(() => {
    if (workflow?.id) {
      setValue(workflow.id);
      setError(WorkflowService.validateName(workflow.id, workflowNames));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  return (
    <Input
      isRequired
      label="Name"
      value={value}
      onChange={onChange}
      errorText={error === true ? undefined : error}
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
    />
  );
};

const PropertiesTab = ({ variant }: Props) => {
  const workflow = useWorkflowConfigContext();
  const updateWorkflow = useBitriseYmlStore(useShallow((s) => s.updateWorkflow));
  const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 100);

  const [{ summary, description }, setValues] = useState({
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
  });

  const onSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { summary: e.target.value });
  };

  const onDescrptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { description: e.target.value });
  };

  useEffect(() => {
    setValues({
      summary: workflow?.userValues.summary || '',
      description: workflow?.userValues.description || '',
    });
  }, [workflow?.userValues.description, workflow?.userValues.summary]);

  return (
    <Box gap="24" display="flex" flexDir="column">
      <NameInput variant={variant} />
      <Textarea label="Summary" value={summary} onChange={onSummaryChange} />
      <Textarea label="Description" value={description} onChange={onDescrptionChange} />
    </Box>
  );
};

export default PropertiesTab;
