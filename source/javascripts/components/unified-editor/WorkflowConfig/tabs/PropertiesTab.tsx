import { ChangeEventHandler, useEffect, useState } from 'react';
import { Box, Textarea } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/models/WorkflowService';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import EditableInput from '@/components/EditableInput/EditableInput';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import GitStatusNameInput from '../components/GitStatusNameInput';

type Props = {
  variant: 'panel' | 'drawer';
  onRename: (name: string) => void;
};

const PropertiesTab = ({ variant, onRename }: Props) => {
  const workflow = useWorkflowConfigContext();

  const isGitStatusNameEnabled =
    useFeatureFlag('enable-custom-commit-status-name') &&
    !WorkflowService.isUtilityWorkflow(workflow?.id || '') &&
    variant === 'panel';
  const updateWorkflow = useBitriseYmlStore((s) => s.updateWorkflow);
  const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 100);

  const [{ summary, description, statusReportName }, setValues] = useState({
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
    statusReportName: workflow?.userValues.status_report_name || '',
  });

  const handleNameChange = useRenameWorkflow(onRename);

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
          workflowId={workflow?.id}
          onChange={handleGitStatusNameChange}
          statusReportName={statusReportName}
        />
      )}
    </Box>
  );
};

export default PropertiesTab;
