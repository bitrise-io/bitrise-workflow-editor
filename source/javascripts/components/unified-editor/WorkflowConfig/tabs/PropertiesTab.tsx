import { Box, Button, Divider, Textarea, useDisclosure } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import EditableInput from '@/components/EditableInput/EditableInput';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import WorkflowService from '@/core/services/WorkflowService';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

import DeleteWorkflowDialog from '../../DeleteWorkflowDialog/DeleteWorkflowDialog';
import PriorityInput from '../../PriorityInput/PriorityInput';
import GitStatusNameInput from '../components/GitStatusNameInput';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  onRename: (name: string) => void;
  onDelete?: (id: string) => void;
};

const NameInput = ({ defaultValue, onRename }: Pick<Props, 'onRename'> & { defaultValue: string }) => {
  const rename = useRenameWorkflow(onRename);
  const otherWorkflows = Object.keys(bitriseYmlStore.getState().yml.workflows ?? {});

  const handleCommit = (newValue: string) => {
    if (newValue !== defaultValue) {
      rename(newValue);
    }
  };

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      defaultValue={defaultValue}
      sanitize={WorkflowService.sanitizeName}
      validate={(name) => WorkflowService.validateName(name, defaultValue, otherWorkflows)}
      onCommit={handleCommit}
    />
  );
};

const SummaryInput = ({ id, defaultValue }: { id: string; defaultValue: string }) => {
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = useDebounceCallback((e) => {
    WorkflowService.updateWorkflowField(id, 'summary', e.target.value);
  }, 150);

  return <Textarea label="Summary" defaultValue={defaultValue} onChange={handleOnChange} />;
};

const DescriptionInput = ({ id, defaultValue }: { id: string; defaultValue: string }) => {
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = useDebounceCallback((e) => {
    WorkflowService.updateWorkflowField(id, 'description', e.target.value);
  }, 150);

  return <Textarea label="Description" defaultValue={defaultValue} onChange={handleOnChange} />;
};

const Priority = ({ id, value }: { id: string; value?: number }) => {
  const handleOnChange = (newValue?: number) => {
    WorkflowService.updateWorkflowField(id, 'priority', newValue);
  };

  return (
    <PriorityInput
      value={value}
      helperText="Set priority between -100 and +100. Default value is 0. Available on certain plans only."
      onChange={handleOnChange}
    />
  );
};

const GitStatusName = ({ id, value = '' }: { id: string; value?: string }) => {
  const handleOnChange = (newValue?: string) => {
    WorkflowService.updateWorkflowField(id, 'status_report_name', newValue);
  };

  return <GitStatusNameInput targetId={id} statusReportName={value} onChange={handleOnChange} />;
};

const PropertiesTab = ({ variant, onRename, onDelete }: Props) => {
  const workflow = useWorkflowConfigContext();
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  const id = workflow?.id || '';
  const isDeleteable = variant === 'panel';
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflow?.id || '');
  const isPriorityEnabled = variant === 'panel' && !isUtilityWorkflow;
  const isGitStatusNameEnabled = variant === 'panel' && !isUtilityWorkflow;
  const shouldShowDivider = isPriorityEnabled || isGitStatusNameEnabled;

  return (
    <Box gap="16" display="flex" flexDir="column">
      <NameInput defaultValue={id} onRename={onRename} />
      <SummaryInput id={id} defaultValue={workflow?.userValues.summary || ''} />
      <DescriptionInput id={id} defaultValue={workflow?.userValues.description || ''} />
      {shouldShowDivider && <Divider marginBlock="8" />}
      {isPriorityEnabled && <Priority id={id} value={workflow?.userValues.priority} />}
      {isGitStatusNameEnabled && <GitStatusName id={id} value={workflow?.userValues.status_report_name} />}

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

  // const workflow = useWorkflowConfigContext();
  // const rename = useRenameWorkflow(onRename);
  // const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  // const updateWorkflow = useBitriseYmlStore((s) => s.updateWorkflow);
  // const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 100);

  // const [{ summary, description, statusReportName, priority }, setValues] = useState({
  //   summary: workflow?.userValues.summary || '',
  //   description: workflow?.userValues.description || '',
  //   statusReportName: workflow?.userValues.status_report_name || '',
  //   priority: workflow?.userValues.priority || undefined,
  // });

  // const handleSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
  //   setValues((prev) => ({ ...prev, summary: e.target.value }));
  //   debouncedUpdateWorkflow(workflow?.id || '', { summary: e.target.value });
  // };

  // const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
  //   setValues((prev) => ({ ...prev, description: e.target.value }));
  //   debouncedUpdateWorkflow(workflow?.id || '', {
  //     description: e.target.value,
  //   });
  // };

  // const handlePriorityChange = (newValue?: number) => {
  //   setValues((prev) => ({ ...prev, priority: newValue }));
  //   debouncedUpdateWorkflow(workflow?.id || '', {
  //     priority: newValue,
  //   });
  // };

  // const handleGitStatusNameChange = (newValue: string, isValid: boolean) => {
  //   setValues((prev) => ({ ...prev, statusReportName: newValue }));
  //   if (isValid) {
  //     debouncedUpdateWorkflow(workflow?.id || '', {
  //       status_report_name: newValue,
  //     });
  //   }
  // };

  // const handleNameChange = (newValue: string) => {
  //   if (newValue !== workflow?.id) {
  //     rename(newValue);
  //   }
  // };

  // useEffect(() => {
  //   setValues({
  //     summary: workflow?.userValues.summary || '',
  //     description: workflow?.userValues.description || '',
  //     statusReportName: workflow?.userValues.status_report_name || '',
  //     priority: workflow?.userValues.priority,
  //   });
  // }, [
  //   workflow?.userValues.description,
  //   workflow?.userValues.priority,
  //   workflow?.userValues.status_report_name,
  //   workflow?.userValues.summary,
  // ]);

  // return (
  //   <Box gap="16" display="flex" flexDir="column">
  //     <EditableInput
  //       isRequired
  //       name="name"
  //       label="Name"
  //       value={workflow?.id || ''}
  //       sanitize={WorkflowService.sanitizeName}
  //       validate={(name) =>
  //         WorkflowService.validateName(
  //           name,
  //           workflow?.id || '',
  //           Object.keys(bitriseYmlStore.getState().yml.workflows ?? {}),
  //         )
  //       }
  //       onCommit={handleNameChange}
  //     />
  //     <Textarea label="Summary" defaultValue={summary} onChange={handleSummaryChange} />
  //     <Textarea label="Description" value={description} onChange={handleDescriptionChange} />
  //     {(isPriorityEnabled || isGitStatusNameEnabled) && <Divider marginBlock="8" />}
  //     {isPriorityEnabled && (
  //       <PriorityInput
  //         onChange={handlePriorityChange}
  //         value={priority}
  //         helperText="Set priority between -100 and +100. Default value is 0. Available on certain plans only."
  //       />
  //     )}
  //     {isGitStatusNameEnabled && (
  //       <GitStatusNameInput
  //         targetId={workflow?.id}
  //         onChange={handleGitStatusNameChange}
  //         statusReportName={statusReportName}
  //       />
  //     )}

  //   </Box>
  // );
};

export default PropertiesTab;
