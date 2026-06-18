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
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import {
  bitriseYmlStore,
  forceRefreshStates,
  getYmlString,
  MERGED_CONFIG_NODE_ID,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useModelValidationStatus from '@/hooks/useModelValidationStatus';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor, { type Props as DiffEditorProps } from './DiffEditor';

type ContentProps = {
  onClose: VoidFunction;
  nodeId?: string;
  fileSelector?: ReactNode;
  isReadOnly?: boolean;
};

export const DiffEditorDialogContent = ({ onClose, nodeId, fileSelector, isReadOnly }: ContentProps) => {
  // useModelValidationStatus only accepts 'valid' | 'invalid' | 'warnings'; map the new
  // 'pending' seed to 'valid' (the diff editor recomputes its own status from markers anyway).
  const seedStatus = useYmlValidationStatus();
  const [ymlStatus, subscribeToModel] = useModelValidationStatus(seedStatus === 'pending' ? 'valid' : seedStatus);
  const [currentText, setCurrentText] = useState<string | undefined>();

  useEffect(() => {
    setCurrentText(undefined);
  }, [nodeId]);

  const fileTexts = useMemo(() => {
    if (!nodeId) {
      return undefined;
    }
    const slice = bitriseYmlStore.getState().files[nodeId];
    return {
      originalText: slice ? YmlUtils.toYml(slice.savedYmlDocument) : '',
      modifiedText: slice ? YmlUtils.toYml(slice.ymlDocument) : '',
    };
  }, [nodeId]);

  const modifiedText = fileTexts ? fileTexts.modifiedText : getYmlString();
  const originalText = fileTexts ? fileTexts.originalText : getYmlString('savedYmlDocument');

  // New file (empty commitSha) has no saved baseline → plain code view, not a two-sided diff.
  const isNewFile = useBitriseYmlStore((s) => {
    const effectiveNodeId = nodeId ?? s.selectedNodeId;
    if (!effectiveNodeId || effectiveNodeId === MERGED_CONFIG_NODE_ID) {
      return false;
    }
    const slice = s.files[effectiveNodeId];
    return Boolean(slice?.editable && !slice.commitSha);
  });

  const isApplyChangesDisabled =
    Boolean(isReadOnly) || currentText === undefined || ymlStatus === 'invalid' || currentText === modifiedText;

  const applyChanges = () => {
    if (currentText === undefined) {
      return;
    }

    if (nodeId) {
      updateFileDocumentByString(nodeId, currentText);
    } else {
      updateBitriseYmlDocumentByString(currentText);
    }
    forceRefreshStates();
    onClose();
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
      <DialogBody flex="1" display="flex" gap="16" minHeight="0">
        {fileSelector}
        <Box flex="1" display="flex" flexDirection="column" gap="16" minWidth="0">
          <Notification status="info">
            {isReadOnly
              ? 'This file is read-only — changes here cannot be saved.'
              : isNewFile
                ? 'This is a new file — edit it below and your changes will be saved.'
                : 'You can edit the right side of the diff view, and your changes will be saved'}
          </Notification>
          {isNewFile ? (
            <Editor
              key={nodeId ?? 'legacy'}
              theme="vs-dark"
              language="yaml"
              defaultValue={modifiedText}
              onChange={(value) => setCurrentText(typeof value === 'string' ? value : undefined)}
              onMount={handlePlainEditorMount}
              options={{ minimap: { enabled: false }, readOnly: isReadOnly }}
              wrapperProps={{ style: { flex: 1, display: 'flex', minHeight: 0 } }}
            />
          ) : (
            originalText &&
            modifiedText && (
              <DiffEditor
                key={nodeId ?? 'legacy'}
                originalText={originalText}
                modifiedText={modifiedText}
                onChange={setCurrentText}
                onMount={handleEditorMount}
                readOnly={isReadOnly}
              />
            )
          )}
        </Box>
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

export const DiffEditorDialogShell = ({ onClose, children, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      {children}
    </Dialog>
  );
};

const DiffEditorDialog = ({ onClose, nodeId, ...rest }: Omit<DialogProps, 'title'> & { nodeId?: string }) => {
  return (
    <DiffEditorDialogShell {...rest} onClose={onClose}>
      <DiffEditorDialogContent onClose={onClose} nodeId={nodeId} />
    </DiffEditorDialogShell>
  );
};

export default DiffEditorDialog;
