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
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';
import { useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { forceRefreshStates, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import useIsModular from '@/hooks/useIsModular';
import useModularConfig from '@/hooks/useModularConfig';
import useModelValidationStatus from '@/hooks/useModelValidationStatus';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor, { type Props as DiffEditorProps } from './DiffEditor';

const ModularDiffBody = ({ onClose }: { onClose: VoidFunction }) => {
  const files = useModularConfig((s) => s.files);
  const changedFiles = files.filter((f) => f.currentContents !== f.savedContents);
  const [activeFileIdx, setActiveFileIdx] = useState(0);

  const activeFile = changedFiles[activeFileIdx];

  if (changedFiles.length === 0) {
    return (
      <>
        <ModalHeader display="flex" gap="16" alignItems="center">
          <Text as="h1" textStyle="comp/dialog/title">
            No changes to show
          </Text>
        </ModalHeader>
        <ModalCloseButton size="large">
          <Icon name="Cross" />
        </ModalCloseButton>
        <DialogBody flex="1" display="flex" alignItems="center" justifyContent="center">
          <Text color="text/secondary">No files have been modified.</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <ModalHeader display="flex" gap="16" alignItems="center" flexWrap="wrap">
        <Text as="h1" textStyle="comp/dialog/title">
          View changes
        </Text>
        <ButtonGroup spacing="8">
          {changedFiles.map((file, idx) => (
            <Button
              key={file.path}
              size="sm"
              variant={idx === activeFileIdx ? 'primary' : 'secondary'}
              onClick={() => setActiveFileIdx(idx)}
            >
              {file.path}
            </Button>
          ))}
        </ButtonGroup>
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
      <DialogBody flex="1" display="flex" gap="16" flexDirection="column">
        <Notification status="info">
          Showing diff for: {activeFile?.path}
        </Notification>
        {activeFile && (
          <DiffEditor
            key={activeFile.path}
            originalText={activeFile.savedContents}
            modifiedText={activeFile.currentContents}
            onChange={() => {}}
          />
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
};

const DiffEditorDialogBody = ({ onClose }: { onClose: VoidFunction }) => {
  const [ymlStatus, subscribeToModel] = useModelValidationStatus(useYmlValidationStatus());
  const [currentText, setCurrentText] = useState<string | undefined>();

  const modifiedText = getYmlString();
  const originalText = getYmlString('savedYmlDocument');

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
          You can edit the right side of the diff view, and your changes will be saved
        </Notification>
        {originalText && modifiedText && (
          <DiffEditor
            originalText={originalText}
            modifiedText={modifiedText}
            onChange={handleChange}
            onMount={handleEditorMount}
          />
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
  const isModular = useIsModular();

  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      {isModular ? (
        <ModularDiffBody onClose={onClose} />
      ) : (
        <DiffEditorDialogBody onClose={onClose} />
      )}
    </Dialog>
  );
};

export default DiffEditorDialog;
