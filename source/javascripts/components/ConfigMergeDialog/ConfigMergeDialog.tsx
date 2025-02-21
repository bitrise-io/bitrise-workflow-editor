import { useEffect } from 'react';
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
} from '@bitrise/bitkit';
import * as monaco from 'monaco-editor';
import { diff3Merge } from 'node-diff3';
import { DiffEditor, loader, MonacoDiffEditor } from '@monaco-editor/react';
import { useShallow } from '@/hooks/useShallow';
import { configMergeDialog, useConfigMergeDialog } from './ConfigMergeDialog.store';

loader.config({ monaco });

type Props = Omit<DialogProps, 'title' | 'isOpen' | 'onClose'> & {
  onSave: VoidFunction;
  onClose: (method: 'close_button' | 'cancel_button') => void;
};

const diffEditorOptions: monaco.editor.IDiffEditorConstructionOptions = {
  automaticLayout: true,
  roundedSelection: false,
  renderSideBySide: false,
  renderGutterMenu: false,
  renderWhitespace: 'all',
  ignoreTrimWhitespace: false,
  padding: {
    top: 16,
    bottom: 16,
  },
  hideUnchangedRegions: {
    enabled: true,
  },
};

const readOnlyDiffEditorOptions: monaco.editor.IDiffEditorConstructionOptions = {
  ...diffEditorOptions,
  readOnly: true,
};

function mergeYamls(yourYaml: string, baseYaml: string, remoteYaml: string) {
  const rows: string[] = [];
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];

  diff3Merge<string>(yourYaml, baseYaml, remoteYaml, { stringSeparator: '\n' }).forEach((region) => {
    if (region.ok) {
      rows.push(...region.ok);
    } else if (region.conflict) {
      rows.push(...region.conflict.b);

      const remoteChangeIsADeletion = region.conflict.b.length === 0;

      if (remoteChangeIsADeletion) {
        decorations.push({
          options: {
            isWholeLine: false,
            blockClassName: 'conflict',
          },
          range: {
            startLineNumber: region.conflict.oIndex + 1,
            startColumn: 1,
            endLineNumber: region.conflict.oIndex + 1,
            endColumn: 1,
          },
        });
      }

      if (!remoteChangeIsADeletion) {
        decorations.push({
          options: {
            isWholeLine: true,
            blockClassName: 'conflict',
          },
          range: {
            startLineNumber: region.conflict.bIndex + 1,
            startColumn: 1,
            endLineNumber: region.conflict.bIndex + region.conflict.b.length,
            endColumn: 1,
          },
        });
      }
    }
  });

  return {
    decorations,
    finalYaml: rows.join('\n'),
  };
}

const ConfigMergeDialog = ({ onSave, onClose, ...props }: Props) => {
  const { isOpen, isLoading, yourYaml, baseYaml, remoteYaml, errorMessage } = useConfigMergeDialog(
    useShallow((s) => ({
      isOpen: s.isOpen,
      isLoading: s.isLoading,
      yourYaml: s.yourYaml,
      baseYaml: s.baseYaml,
      remoteYaml: s.remoteYaml,
      errorMessage: s.errorMessage,
    })),
  );

  const { decorations, finalYaml } = mergeYamls(yourYaml, baseYaml, remoteYaml);

  const onMount = (editor: MonacoDiffEditor) => {
    const modifiedEditor = editor.getModifiedEditor();

    modifiedEditor.onDidChangeModelContent((e) => {
      configMergeDialog.setState({ finalYaml: modifiedEditor.getValue() });

      const removableDecorationIds = e.changes.reduce<Set<string>>((acc, c) => {
        const { startLineNumber, endLineNumber } = c.range;

        for (let i = startLineNumber; i <= endLineNumber; i++) {
          modifiedEditor.getLineDecorations(i)?.forEach((d) => {
            if (d.options.blockClassName === 'conflict') {
              acc.add(d.id);
            }
          });
        }

        return acc;
      }, new Set<string>([]));

      modifiedEditor.removeDecorations(Array.from(removableDecorationIds));
    });

    editor.createDecorationsCollection(decorations);
  };

  useEffect(() => {
    if (isOpen) {
      configMergeDialog.setState({ finalYaml });
    }
  }, [isOpen, finalYaml]);

  return (
    <>
      <Dialog
        size="full"
        isOpen={isOpen}
        title="Review changes"
        isClosable={!isLoading}
        minHeight={['100dvh', 'unset']}
        onClose={() => onClose('close_button')}
        {...props}
      >
        <DialogBody flex="1" display="flex" flexDirection="column" gap={24}>
          <Text>
            There are changes outside your current editing session. Review the differences and resolve any conflicts to
            proceed.
          </Text>
          <Box display="flex" flex="1" gap="4">
            <Box display="flex" flexDirection="column" flex="1" gap="4">
              <Text textStyle="body/md/semibold">Your changes</Text>
              <Box flex="1" borderRadius="8" overflow="hidden" bg="rgb(30,30,30)" opacity="0.9">
                <DiffEditor
                  key={yourYaml}
                  theme="vs-dark"
                  language="yaml"
                  original={baseYaml}
                  modified={yourYaml}
                  options={readOnlyDiffEditorOptions}
                  keepCurrentModifiedModel
                  keepCurrentOriginalModel
                />
              </Box>
            </Box>

            <Box alignSelf="center">
              <Icon name="ArrowRight" color="icon/tertiary" size="24" />
            </Box>

            <Box display="flex" flexDirection="column" flex="1" gap="4">
              <Text textStyle="body/md/semibold">Results</Text>
              <Box flex="1" borderRadius="8" overflow="hidden" bg="rgb(30,30,30)">
                <DiffEditor
                  key={finalYaml}
                  theme="vs-dark"
                  language="yaml"
                  original={baseYaml}
                  modified={finalYaml}
                  options={diffEditorOptions}
                  keepCurrentModifiedModel
                  keepCurrentOriginalModel
                  onMount={onMount}
                />
              </Box>
            </Box>

            <Box alignSelf="center">
              <Icon name="ArrowLeft" color="icon/tertiary" size="24" />
            </Box>

            <Box display="flex" flexDirection="column" flex="1" gap="4">
              <Text textStyle="body/md/semibold">Remote changes</Text>
              <Box flex="1" borderRadius="8" overflow="hidden" bg="rgb(30,30,30)" opacity="0.9">
                <DiffEditor
                  key={remoteYaml}
                  theme="vs-dark"
                  language="yaml"
                  original={baseYaml}
                  modified={remoteYaml}
                  options={readOnlyDiffEditorOptions}
                  keepCurrentModifiedModel
                  keepCurrentOriginalModel
                />
              </Box>
            </Box>
          </Box>
          <Notification status="info">
            <Text textStyle="comp/notification/title">Merge conflict auto-resolution</Text>
            <Text>
              In case of a conflict, remote changes will take priority over your local changes. To retain your changes,
              edit the results before saving.
            </Text>
          </Notification>
          {errorMessage && (
            <Notification status="error">
              <Text textStyle="comp/notification/title">Error saving...</Text>
              <Text>{errorMessage}</Text>
            </Notification>
          )}
        </DialogBody>
        <DialogFooter>
          <ButtonGroup spacing={16}>
            <Button variant="secondary" isDisabled={isLoading} onClick={() => onClose('cancel_button')}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isLoading} onClick={onSave}>
              Save results
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
      <style>{`
        .monaco-diff-editor .conflict {
          border: 1px solid rgba(255, 0, 0, 1);
        }
      `}</style>
    </>
  );
};

export default ConfigMergeDialog;
