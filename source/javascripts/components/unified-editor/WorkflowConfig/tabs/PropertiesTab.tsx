import { ChangeEventHandler, useEffect, useState } from 'react';
import { Box, Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/services/WorkflowService';
import EditableInput from '@/components/EditableInput/EditableInput';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import DeleteWorkflowDialog from '@/components/unified-editor/DeleteWorkflowDialog/DeleteWorkflowDialog';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import GitStatusNameInput from '../components/GitStatusNameInput';

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

  const [{ summary, description, statusReportName }, setValues] = useState({
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
    statusReportName: workflow?.userValues.status_report_name || '',
  });
  const isDeleteable = variant === 'panel';
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflow?.id || '');
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
    });
  }, [workflow?.userValues.description, workflow?.userValues.status_report_name, workflow?.userValues.summary]);

  return (
    <Box gap="24" display="flex" flexDir="column">
      <EditableInput
        isRequired
        name="name"
        label="Name"
        value={workflow?.id || ''}
        sanitize={WorkflowService.sanitizeName}
        validate={WorkflowService.validateName}
        onCommit={handleNameChange}
      />
      <Textarea label="Summary" value={summary} onChange={handleSummaryChange} />
      <Textarea label="Description" value={description} onChange={handleDescriptionChange} />
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
