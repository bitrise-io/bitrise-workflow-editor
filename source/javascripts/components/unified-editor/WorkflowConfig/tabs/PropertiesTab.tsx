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
import { Box, ButtonGroup, CodeSnippet, ControlButton, Input, Text, Textarea } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import useRenameWorkflow from '@/components/unified-editor/WorkflowConfig/hooks/useRenameWorkflow';
import { useWorkflowConfigContext } from '../WorkflowConfig.context';
import WindowUtils from '../../../../core/utils/WindowUtils';

type Props = {
  variant: 'panel' | 'drawer';
};

type State = {
  isEditing: boolean;
  value: string;
  committedValue: string;
  validationResult: boolean | string;
};

const TOOLTIP_MAP: Record<string, string> = {
  '<event_type>': 'PR / Push / Tag',
  '<project_slug>': 'The unique identifier of your project.',
  '<project_title>': 'Optional title of your project.',
  '<target_id>': 'Triggered Workflow or Pipeline ID',
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
  const [error, setError] = useState<string>('');

  const pageProps = WindowUtils.pageProps();
  const statusReport = pageProps?.settings?.statusReport;
  const projectBasedTemplate = pageProps?.settings?.statusReport?.defaultProjectBasedStatusNameTemplate;
  const projectSlug = pageProps?.settings?.statusReport?.variables['<project_slug>'];
  const variables = pageProps?.settings?.statusReport?.variables;

  const obj = {
    '<event_type>': variables?.['<event_type>'] || 'pr',
    '<target_id>': variables?.['<target_id>'] || workflow?.id || '',
  };

  let preview = '';
  if (statusReport) {
    if (statusReportName && variables && variables !== null) {
      preview = `Preview: ${statusReportName
        .replace(/<project_slug>/g, variables['<project_slug>'])
        .replace(/<project_title>/g, variables['<project_title>'])
        .replace(/<event_type>/g, obj['<event_type>'])
        .replace(/<target_id>/g, obj['<target_id>'])}`;
    } else {
      preview = `Preview: ci/bitrise/${projectSlug}/pr`;
    }
  }

  const validateCharacters = (value: string) => {
    const allowedPattern = /^[ A-Za-z,.():/[\]-_|0-9<>]*$/;
    const invalidChars = Array.from(value).filter((char: string) => !allowedPattern.test(char));

    if (invalidChars.length > 0) {
      return `"${invalidChars[0]}" is not allowed. Allowed characters: A-Za-z,.():/-_0-9 []|<>`;
    }
    return true;
  };

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

  const onGitStatusNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value;
    const validationResult = validateCharacters(newValue);

    setValues((prev) => ({ ...prev, statusReportName: newValue }));
    debouncedUpdateWorkflow(workflow?.id || '', {
      status_report_name: newValue,
    });

    setError(validationResult === true ? '' : validationResult);
  };

  useEffect(() => {
    setValues({
      summary: workflow?.userValues.summary || '',
      description: workflow?.userValues.description || '',
      statusReportName: workflow?.userValues.status_report_name || '',
    });
  }, [workflow?.userValues.description, workflow?.userValues.status_report_name, workflow?.userValues.summary]);

  return (
    <>
      <Box gap="24" display="flex" flexDir="column">
        <NameInput variant={variant} />
        <Textarea label="Summary" value={summary} onChange={onSummaryChange} />
        <Textarea label="Description" value={description} onChange={onDescriptionChange} />
      </Box>
      <Box gap="8" display="flex" flexDir="column">
        <Input
          label="Git status name"
          helperText={error || `Allowed characters: A-Za-z,.():/-_0-9 []|<>`}
          errorText={error}
          placeholder={projectBasedTemplate}
          value={statusReportName}
          onChange={onGitStatusNameChange}
          withCounter
          maxLength={100}
          marginBlockStart="24"
        />
        <Text color="input/text/helper" textStyle="body/sm/regular">
          {preview}
        </Text>
        <Text color="input/text/helper" textStyle="body/sm/regular" marginBlockEnd="8">
          You can use the following variables in your string:
        </Text>
      </Box>
      {Object.keys(TOOLTIP_MAP).map((variable) => (
        <CodeSnippet variant="inline" tooltipLabel={TOOLTIP_MAP[variable]} marginRight="8">
          {variable}
        </CodeSnippet>
      ))}
    </>
  );
};

export default PropertiesTab;
