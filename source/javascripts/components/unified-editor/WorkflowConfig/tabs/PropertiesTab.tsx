import { Box, Button, Divider, Textarea, useDisclosure } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import EditableInput from '@/components/EditableInput/EditableInput';
import WorkflowService from '@/core/services/WorkflowService';
import { getBitriseYml } from '@/core/stores/BitriseYmlStore';
import { useIsReadOnlyView } from '@/hooks/useTree';

import DeleteWorkflowDialog from '../../DeleteWorkflowDialog/DeleteWorkflowDialog';
import PriorityInput from '../../PriorityInput/PriorityInput';
import GitStatusNameInput from '../components/GitStatusNameInput';
import useRenameWorkflow from '../hooks/useRenameWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';

type Props = {
  variant: 'panel' | 'drawer';
  onRename: (name: string) => void;
  onDelete?: (id: string) => void;
};

const NameInput = ({ onRename, isDisabled }: Pick<Props, 'onRename'> & { isDisabled?: boolean }) => {
  const rename = useRenameWorkflow(onRename);
  const value = useWorkflowConfigContext((s) => s?.id || '');
  const otherWorkflows = Object.keys(getBitriseYml().workflows ?? {});

  const handleCommit = (newValue: string) => {
    if (newValue !== value) {
      rename(newValue);
    }
  };

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      value={value}
      isDisabled={isDisabled}
      sanitize={WorkflowService.sanitizeName}
      validate={(name) => WorkflowService.validateName(name, value, otherWorkflows)}
      onCommit={handleCommit}
    />
  );
};

const SummaryInput = ({ workflowId, isDisabled }: { workflowId: string; isDisabled?: boolean }) => {
  const value = useWorkflowConfigContext((s) => s?.userValues?.summary || '');
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    WorkflowService.updateWorkflowField(workflowId, 'summary', e.target.value);
  };

  return <Textarea key={workflowId} label="Summary" value={value} isDisabled={isDisabled} onChange={handleOnChange} />;
};

const DescriptionInput = ({ workflowId, isDisabled }: { workflowId: string; isDisabled?: boolean }) => {
  const value = useWorkflowConfigContext((s) => s?.userValues?.description || '');
  const handleOnChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    WorkflowService.updateWorkflowField(workflowId, 'description', e.target.value);
  };

  return <Textarea label="Description" value={value} isDisabled={isDisabled} onChange={handleOnChange} />;
};

const Priority = ({ workflowId, isDisabled }: { workflowId: string; isDisabled?: boolean }) => {
  const value = useWorkflowConfigContext((s) => s?.userValues?.priority);
  const handleOnChange = (newValue?: number) => {
    WorkflowService.updateWorkflowField(workflowId, 'priority', newValue);
  };

  return (
    <PriorityInput
      value={value}
      isDisabled={isDisabled}
      helperText="Set priority between -100 and +100. Default value is 0. Available on certain plans only."
      onChange={handleOnChange}
    />
  );
};

const GitStatusName = ({ workflowId, isDisabled }: { workflowId: string; isDisabled?: boolean }) => {
  const value = useWorkflowConfigContext((s) => s?.userValues?.status_report_name || '');
  const handleOnChange = (newValue?: string) => {
    WorkflowService.updateWorkflowField(workflowId, 'status_report_name', newValue);
  };

  return (
    <GitStatusNameInput
      targetId={workflowId}
      statusReportName={value}
      isDisabled={isDisabled}
      onChange={handleOnChange}
    />
  );
};

const PropertiesTab = ({ variant, onRename, onDelete }: Props) => {
  const workflowId = useWorkflowConfigContext((s) => s?.id || '');
  const isReadOnlyView = useIsReadOnlyView();
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  const isDeleteable = variant === 'panel';
  const isUtilityWorkflow = WorkflowService.isUtilityWorkflow(workflowId);
  const isPriorityEnabled = variant === 'panel' && !isUtilityWorkflow;
  const isGitStatusNameEnabled = variant === 'panel' && !isUtilityWorkflow;
  const shouldShowDivider = isPriorityEnabled || isGitStatusNameEnabled;

  return (
    <Box gap="16" display="flex" flexDir="column">
      <NameInput onRename={onRename} isDisabled={isReadOnlyView} />
      <SummaryInput workflowId={workflowId} isDisabled={isReadOnlyView} />
      <DescriptionInput workflowId={workflowId} isDisabled={isReadOnlyView} />
      {shouldShowDivider && <Divider marginBlock="8" />}
      {isPriorityEnabled && <Priority workflowId={workflowId} isDisabled={isReadOnlyView} />}
      {isGitStatusNameEnabled && <GitStatusName workflowId={workflowId} isDisabled={isReadOnlyView} />}

      {isDeleteable && (
        <Button
          isDanger
          size="lg"
          alignSelf="start"
          variant="secondary"
          leftIconName="Trash"
          isDisabled={isReadOnlyView}
          aria-label={`Delete ${workflowId ? `"${workflowId}"` : 'Workflow'}`}
          onClick={openDeleteDialog}
        >
          Delete Workflow
        </Button>
      )}

      {isDeleteable && (
        <DeleteWorkflowDialog
          workflowId={workflowId}
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onDeleteWorkflow={onDelete}
        />
      )}
    </Box>
  );
};

export default PropertiesTab;
