import {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEvent,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { Box, ButtonGroup, ControlButton, Input, Textarea } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import GitStatusNameInput from '../components/GitStatusNameInput';

type Props = {
  variant: 'panel' | 'drawer';
};

type State = {
  isEditing: boolean;
  value: string;
  committedValue: string;
  validationResult: boolean | string;
};

const NameInput = ({ variant }: Props) => {
  const workflow = useWorkflowConfigContext();
  const workflowNames = Object.keys(useWorkflows()).filter((id) => id !== workflow?.id);
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const { openWorkflowConfigDrawer } = useWorkflowsPageStore();

  // TODO maybe useEditable hook from Chakra UI
  const [editable, updateEditable] = useReducer<Reducer<State, Partial<State>>>(
    (state, partial) => ({ ...state, ...partial }),
    {
      isEditing: false,
      value: workflow?.id || '',
      committedValue: workflow?.id || '',
      validationResult: WorkflowService.validateName(workflow?.id || '', workflowNames),
    },
  );

  const handleEdit = useCallback(() => {
    updateEditable({ isEditing: true });
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = WorkflowService.sanitizeName(e.target.value);
      const validationResult = WorkflowService.validateName(value, workflowNames);
      updateEditable({ value, validationResult });
    },
    [workflowNames],
  );

  const handleCancel = useCallback(() => {
    const value = editable.committedValue;
    updateEditable({ value, isEditing: false, validationResult: true });
  }, [editable.committedValue]);

  const performRename = useRenameWorkflow((newWorkflowId: string) => {
    if (variant === 'panel') {
      setSelectedWorkflow(newWorkflowId);
    }

    if (variant === 'drawer') {
      openWorkflowConfigDrawer(newWorkflowId);
    }
  });

  const handleCommit = useCallback(() => {
    if (editable.validationResult !== true) {
      return;
    }

    const committedValue = editable.value;
    performRename(committedValue);
    updateEditable({ committedValue, isEditing: false });
  }, [editable.value, performRename, editable.validationResult]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (editable.isEditing) {
        e.stopPropagation();
      }

      if (e.key === 'Enter') {
        if (editable.isEditing) {
          handleCommit();
        } else {
          handleEdit();
        }
      }

      if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [editable.isEditing, handleCancel, handleCommit, handleEdit],
  );

  useEffect(() => {
    if (workflow?.id) {
      updateEditable({
        value: workflow.id,
        committedValue: workflow.id,
        validationResult: WorkflowService.validateName(workflow.id, workflowNames),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  return (
    <Input
      label="Name"
      isRequired
      isReadOnly={!editable.isEditing}
      value={editable.value}
      onChange={handleChange}
      onKeyDown={handleKeyPress}
      inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
      errorText={editable.validationResult === true ? undefined : editable.validationResult}
      rightAddonPlacement="inside"
      rightAddon={
        <Box p="4">
          {editable.isEditing ? (
            <ButtonGroup justifyContent="center" spacing="0">
              <ControlButton
                size="md"
                aria-label="Change"
                iconName="Check"
                isDisabled={editable.validationResult !== true}
                onClick={handleCommit}
              />
              <ControlButton size="md" aria-label="Cancel" iconName="Cross" onClick={handleCancel} />
            </ButtonGroup>
          ) : (
            <ControlButton size="md" aria-label="Edit" iconName="Pencil" onClick={handleEdit} />
          )}
        </Box>
      }
    />
  );
};

const PropertiesTab = ({ variant }: Props) => {
  const workflow = useWorkflowConfigContext();
  const updateWorkflow = useBitriseYmlStore((s) => s.updateWorkflow);
  const debouncedUpdateWorkflow = useDebounceCallback(updateWorkflow, 100);

  const [{ summary, description, statusReportName }, setValues] = useState({
    summary: workflow?.userValues.summary || '',
    description: workflow?.userValues.description || '',
    statusReportName: workflow?.userValues.status_report_name || '',
  });

  const onSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', { summary: e.target.value });
  };

  const onDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateWorkflow(workflow?.id || '', {
      description: e.target.value,
    });
  };

  const onGitStatusNameChange = (newValue: string, isValid: boolean) => {
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
      <NameInput variant={variant} />
      <Textarea label="Summary" value={summary} onChange={onSummaryChange} />
      <Textarea label="Description" value={description} onChange={onDescriptionChange} />
      <GitStatusNameInput
        workflowId={workflow?.id}
        onChange={onGitStatusNameChange}
        statusReportName={statusReportName}
      />
    </Box>
  );
};

export default PropertiesTab;
