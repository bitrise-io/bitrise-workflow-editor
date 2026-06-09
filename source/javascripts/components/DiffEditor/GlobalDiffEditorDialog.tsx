import {
  Box,
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
import { Editor, type EditorProps } from '@monaco-editor/react';
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';
import { useMemo, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import FileTreeView from '@/components/FileTreeViewer/FileTreeView';
import {
  bitriseYmlStore,
  forceRefreshStates,
  isFileDirty,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useModelValidationStatus from '@/hooks/useModelValidationStatus';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor, { type Props as DiffEditorProps } from './DiffEditor';

const GlobalDiffEditorDialogBody = ({ onClose }: { onClose: VoidFunction }) => {
  const tree = useBitriseYmlStore((s) => s.tree);
  const dirtyIds = useBitriseYmlStore(
    (s) =>
      new Set(
        Object.values(s.files)
          .filter((slice) => isFileDirty(slice))
          .map((slice) => slice.nodeId),
      ),
  );
  const dirtyFiles = useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((slice) => isFileDirty(slice))
      // No commitSha = session-created file with no saved baseline → plain code view, not a diff.
      .map((slice) => ({ nodeId: slice.nodeId, editable: slice.editable, isNew: slice.editable && !slice.commitSha })),
  );

  const activeNodeId = useBitriseYmlStore((s) => s.selectedNodeId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    () => dirtyFiles.find((file) => file.nodeId === activeNodeId)?.nodeId ?? dirtyFiles[0]?.nodeId,
  );

  const [ymlStatus, subscribeToModel] = useModelValidationStatus(useYmlValidationStatus());
  const [currentText, setCurrentText] = useState<string | undefined>();

  const selected = dirtyFiles.find((file) => file.nodeId === selectedNodeId) ?? dirtyFiles[0];
  const effectiveNodeId = selected?.nodeId;
  const isNewFile = Boolean(selected?.isNew);

  const { originalText, modifiedText } = useMemo(() => {
    if (!effectiveNodeId) {
      return { originalText: '', modifiedText: '' };
    }
    const slice = bitriseYmlStore.getState().files[effectiveNodeId];
    return {
      originalText: slice ? YmlUtils.toYml(slice.savedYmlDocument) : '',
      modifiedText: slice ? YmlUtils.toYml(slice.ymlDocument) : '',
    };
  }, [effectiveNodeId]);

  const isReadOnly = !selected?.editable;
  const isApplyChangesDisabled =
    isReadOnly || currentText === undefined || ymlStatus === 'invalid' || currentText === modifiedText;

  const applyChanges = () => {
    if (currentText === undefined || !effectiveNodeId) {
      return;
    }
    updateFileDocumentByString(effectiveNodeId, currentText);
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

  const isDirty = useMemo(() => (node: { nodeId: string }) => dirtyIds.has(node.nodeId), [dirtyIds]);

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
        <Box width="280px" flexShrink={0} overflowY="auto" borderRight="1px solid" borderColor="border/minimal" pr="8">
          {tree && (
            <FileTreeView
              rootNode={tree}
              filter={isDirty}
              selectedNodeId={effectiveNodeId}
              onSelect={(nodeId) => {
                setSelectedNodeId(nodeId);
                setCurrentText(undefined);
              }}
            />
          )}
        </Box>
        <Box flex="1" display="flex" flexDirection="column" gap="16" minWidth="0">
          <Notification status="info">
            {isNewFile
              ? 'This is a new file — edit it below and your changes will be saved.'
              : 'You can edit the right side of the diff view, and your changes will be saved'}
          </Notification>
          {effectiveNodeId &&
            (isNewFile ? (
              // New file has no saved baseline → plain code view, not a diff against an empty stub.
              <Box flex="1" display="flex" minHeight="0">
                <Editor
                  key={effectiveNodeId}
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
              <DiffEditor
                key={effectiveNodeId}
                originalText={originalText}
                modifiedText={modifiedText}
                onChange={setCurrentText}
                onMount={handleEditorMount}
              />
            ))}
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

/**
 * The header "Show diff" dialog in modular mode: a global view of all unsaved files.
 * Left tree switches between modified files; right shows the selected file's editable
 * saved → current diff, with "Apply changes" writing back to it.
 */
const GlobalDiffEditorDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      <GlobalDiffEditorDialogBody onClose={onClose} />
    </Dialog>
  );
};

export default GlobalDiffEditorDialog;
