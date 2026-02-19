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
import useMonacoMarkerStatus from '@/hooks/useMonacoMarkerStatus';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor from './DiffEditor';

const DiffEditorDialogBody = ({ onClose }: { onClose: VoidFunction }) => {
  const [ymlStatus, subscribeToModel] = useMonacoMarkerStatus(useYmlValidationStatus());
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
            onMount={(editor) => {
              const model = editor.getModifiedEditor().getModel();
              if (model) {
                subscribeToModel(model);
              }
            }}
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
  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      <DiffEditorDialogBody onClose={onClose} />
    </Dialog>
  );
};

export default DiffEditorDialog;
