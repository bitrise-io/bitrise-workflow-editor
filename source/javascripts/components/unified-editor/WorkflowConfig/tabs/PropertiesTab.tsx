import { Box, Button, Divider, Textarea, useDisclosure } from '@bitrise/bitkit';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import EditableInput from '@/components/EditableInput/EditableInput';
import DeleteWorkflowDialog from '@/components/unified-editor/DeleteWorkflowDialog/DeleteWorkflowDialog';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import WorkflowService from '@/core/services/WorkflowService';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import PriorityInput from '../../PriorityInput/PriorityInput';
import GitStatusNameInput from '../components/GitStatusNameInput';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  onRename: (name: string) => void;
  onDelete?: (id: string) => void;
};

const PropertiesTab = ({ variant, onRename, onDelete }: Props) => {
  const workflow = useWorkflowConfigContext();
  const rename = useRenameWorkflow(onRename);
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  const updateWorkflow = useBitriseYmlStore((s) => s.updateWorkflow);
  const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 100);

  const [{ summary, description, statusReportName, priority }, setValues] = useState({
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
    statusReportName: workflow?.userValues.status_report_name || '',
    priority: workflow?.userValues.priority || undefined,
  });
  const isDeleteable = variant === 'panel';
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflow?.id || '');
  const isPriorityEnabled = variant === 'panel' && !isUtilityWorkflow;
  const isGitStatusNameEnabled = variant === 'panel' && !isUtilityWorkflow;

  const handleSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { summary: e.target.value });
  };

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', {
      description: e.target.value,
    });
  };

  const handlePriorityChange = (newValue?: number) => {
    setValues((prev) => ({ ...prev, priority: newValue }));
    debouncedUpdateWorkflow(workflow?.id || '', {
      priority: newValue,
    });
  };

  const handleGitStatusNameChange = (newValue: string, isValid: boolean) => {
    setValues((prev) => ({ ...prev, statusReportName: newValue }));
    if (isValid) {
      debouncedUpdateWorkflow(workflow?.id || '', {
        status_report_name: newValue,
      });
    }
  };

  const handleNameChange = (newValue: string) => {
    if (newValue !== workflow?.id) {
      rename(newValue);
    }
  };

  useEffect(() => {
    setValues({
      summary: workflow?.userValues.summary || '',
      description: workflow?.userValues.description || '',
      statusReportName: workflow?.userValues.status_report_name || '',
      priority: workflow?.userValues.priority,
    });
  }, [
    workflow?.userValues.description,
    workflow?.userValues.priority,
    workflow?.userValues.status_report_name,
    workflow?.userValues.summary,
  ]);

  const validateName = (value: string) => {
    const keys = Object.keys(bitriseYmlStore.getState().yml.workflows ?? {});
    return WorkflowService.validateName(
      value,
      keys.filter((key) => key !== workflow?.id),
    );
  };

  return (
    <Box gap="16" display="flex" flexDir="column">
      <EditableInput
        isRequired
        name="name"
        label="Name"
        value={workflow?.id || ''}
        sanitize={WorkflowService.sanitizeName}
        validate={validateName}
        onCommit={handleNameChange}
      />
      <Textarea label="Summary" value={summary} onChange={handleSummaryChange} />
      <Textarea label="Description" value={description} onChange={handleDescriptionChange} />
      {(isPriorityEnabled || isGitStatusNameEnabled) && <Divider marginBlock="8" />}
      {isPriorityEnabled && (
        <PriorityInput
          onChange={handlePriorityChange}
          value={priority}
          helperText="Set priority between -100 and +100. Default value is 0. Available on certain plans only."
        />
      )}
      {isGitStatusNameEnabled && (
        <GitStatusNameInput
          targetId={workflow?.id}
          onChange={handleGitStatusNameChange}
          statusReportName={statusReportName}
        />
      )}
      {isDeleteable && (
        <Button
          isDanger
          size="lg"
          alignSelf="start"
          variant="secondary"
          leftIconName="Trash"
          aria-label={`Delete ${workflow?.id ? `"${workflow?.id}"` : 'Workflow'}`}
          onClick={openDeleteDialog}
        >
          Delete Workflow
        </Button>
      )}
      {isDeleteable && (
        <DeleteWorkflowDialog
          workflowId={workflow?.id || ''}
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onDeleteWorkflow={onDelete}
        />
      )}
    </Box>
  );
};

export default PropertiesTab;
