import {
  Button,
  ButtonGroup,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogProps,
  Icon,
  Notification,
  Text,
  Tooltip,
} from '@bitrise/bitkit';
import { Box } from '@chakra-ui/react/box';
import { Editor, type EditorProps } from '@monaco-editor/react';
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';
import { useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import {
  forceRefreshStates,
  getYmlString,
  MERGED_CONFIG_NODE_ID,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useModelValidationStatus from '@/hooks/useModelValidationStatus';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor, { type Props as DiffEditorProps } from './DiffEditor';

const DiffEditorDialogBody = ({ onClose }: { onClose: VoidFunction }) => {
  const [ymlStatus, subscribeToModel] = useModelValidationStatus(useYmlValidationStatus());
  const [currentText, setCurrentText] = useState<string | undefined>();

  const modifiedText = getYmlString();
  const originalText = getYmlString('savedYmlDocument');

  // A session-created file (editable, not yet on the branch → empty commitSha)
  // has no saved baseline; show a plain code view instead of a two-sided diff.
  const isNewFile = useBitriseYmlStore((s) => {
    const nodeId = s.selectedNodeId;
    if (!nodeId || nodeId === MERGED_CONFIG_NODE_ID) {
      return false;
    }
    const slice = s.files[nodeId];
    return Boolean(slice?.editable && !slice.commitSha);
  });

  const isApplyChangesDisabled = currentText === undefined || ymlStatus === 'invalid' || currentText === modifiedText;

  const applyChanges = () => {
    if (currentText === undefined) {
      return;
    }

    updateBitriseYmlDocumentByString(currentText);
    forceRefreshStates();
    onClose();
  };

  const handleChange = (text: string) => {
    setCurrentText(text);
  };

  const handleEditorMount: DiffEditorProps['onMount'] = (editor) => {
    const model = editor.getModifiedEditor().getModel();
    if (model) {
      subscribeToModel(model);
    }
  };

  const handlePlainEditorMount: EditorProps['onMount'] = (editor) => {
    const model = editor.getModel();
    if (model) {
      subscribeToModel(model);
    }
  };

  useEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();

        if (!isApplyChangesDisabled) {
          applyChanges();
        }
      }
    },
    undefined,
    { capture: true },
  );

  return (
    <>
      <ModalHeader display="flex" gap="16" alignItems="center">
        <Text as="h1" textStyle="comp/dialog/title">
          View and edit YAML changes
        </Text>
        <YmlValidationBadge status={ymlStatus} />
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
      <DialogBody flex="1" display="flex" gap="16" flexDirection="column">
        <Notification status="info">
          {isNewFile
            ? 'This is a new file — edit it below and your changes will be saved.'
            : 'You can edit the right side of the diff view, and your changes will be saved'}
        </Notification>
        {isNewFile ? (
          <Box flex="1" display="flex" minHeight="0">
            <Editor
              theme="vs-dark"
              language="yaml"
              defaultValue={modifiedText}
              onChange={(value) => setCurrentText(typeof value === 'string' ? value : undefined)}
              onMount={handlePlainEditorMount}
              options={{ minimap: { enabled: false } }}
              wrapperProps={{ style: { flex: 1, display: 'flex' } }}
            />
          </Box>
        ) : (
          originalText &&
          modifiedText && (
            <DiffEditor
              originalText={originalText}
              modifiedText={modifiedText}
              onChange={handleChange}
              onMount={handleEditorMount}
            />
          )
        )}
      </DialogBody>
      <DialogFooter>
        <ButtonGroup spacing="16">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
            placement="top-end"
            isDisabled={ymlStatus !== 'invalid'}
            label="YAML is invalid, please fix it before applying changes"
          >
            <Button variant="primary" isDisabled={isApplyChangesDisabled} onClick={applyChanges}>
              Apply changes
            </Button>
          </Tooltip>
        </ButtonGroup>
      </DialogFooter>
    </>
  );
};

const DiffEditorDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      <DiffEditorDialogBody onClose={onClose} />
    </Dialog>
  );
};

export default DiffEditorDialog;
