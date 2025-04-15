import { useRef, useState } from 'react';

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
import { toMerged } from 'es-toolkit';
import { diff3Merge } from 'node-diff3';
import { useQuery } from '@tanstack/react-query';
import { DiffEditor, loader, MonacoDiffEditor } from '@monaco-editor/react';

import PageProps from '@/core/utils/PageProps';
import useCurrentPage from '@/hooks/useCurrentPage';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { useSaveCiConfig } from '@/hooks/useCiConfig';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore, initFromServerResponse } from '@/core/stores/BitriseYmlStore';
import LoadingState from '@/components/LoadingState';

loader.config({ monaco });

type Props = Omit<DialogProps, 'title'>;

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

  diff3Merge<string>(yourYaml, baseYaml, remoteYaml, {
    stringSeparator: '\n',
  }).forEach((region) => {
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
    mergedYml: rows.join('\n'),
  };
}

function useInitialCiConfigs() {
  const projectSlug = PageProps.appSlug();

  return useQuery({
    queryKey: ['initial-ci-configs', projectSlug],
    queryFn: async ({ signal }) => {
      return {
        yourYml: await BitriseYmlApi.formatCiConfig(BitriseYmlApi.toYml(bitriseYmlStore.getState().yml), signal),
        baseYml: await BitriseYmlApi.formatCiConfig(BitriseYmlApi.toYml(bitriseYmlStore.getState().savedYml), signal),
        ...(await BitriseYmlApi.getCiConfig({
          projectSlug,
          format: 'yml',
          signal,
        }).then((res) => ({
          remoteYml: res.data,
          remoteVersion: res.version,
        }))),
      };
    },
  });
}

const ConfigMergeDialogContent = ({ onClose }: { onClose: VoidFunction }) => {
  const currentPage = useCurrentPage();
  const [clientError, setClientError] = useState<Error>();
  const { data, error: initialError, isFetching, refetch } = useInitialCiConfigs();
  const finalYmlEditor = useRef<ReturnType<MonacoDiffEditor['getModifiedEditor']>>();
  const [nextData, setNextData] = useState<Partial<ReturnType<typeof useInitialCiConfigs>['data']>>();

  const {
    error: saveError,
    mutate: saveCiConfig,
    isPending: isSaving,
  } = useSaveCiConfig({
    onSuccess: ({ data: ymlString, version }) => {
      onClose();
      initFromServerResponse({ ymlString, version });
    },
  });

  if (isFetching) {
    return <LoadingState />;
  }

  if (initialError || !data) {
    return (
      <Notification status="error">
        <Text textStyle="comp/notification/title">Error fetching initial configs</Text>
        <Text>{initialError?.message || 'Initial configs not found'}</Text>
      </Notification>
    );
  }

  const isLoading = isSaving || isFetching;
  const { yourYml, baseYml, remoteYml, remoteVersion } = toMerged(data, nextData ?? {});
  const { mergedYml, decorations } = mergeYamls(yourYml, baseYml, remoteYml);

  const onFinalYmlEditorMount = (editor: MonacoDiffEditor) => {
    finalYmlEditor.current = editor.getModifiedEditor();

    finalYmlEditor.current?.onDidChangeModelContent((e) => {
      const removableDecorationIds = e.changes.reduce<Set<string>>((acc, c) => {
        const { startLineNumber, endLineNumber } = c.range;

        for (let i = startLineNumber; i <= endLineNumber; i++) {
          finalYmlEditor.current?.getLineDecorations(i)?.forEach((d) => {
            if (d.options.blockClassName === 'conflict') {
              acc.add(d.id);
            }
          });
        }

        return acc;
      }, new Set<string>([]));

      finalYmlEditor.current?.removeDecorations(Array.from(removableDecorationIds));
    });

    editor.createDecorationsCollection(decorations);
  };

  const handleCancel = () => {
    onClose();
    segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
      tab_name: currentPage,
      popup_step_dismiss_method: 'close_button',
    });
  };

  const handleSave = () => {
    try {
      setClientError(undefined);
      saveCiConfig(
        {
          yml: BitriseYmlApi.fromYml(finalYmlEditor.current?.getValue() || ''),
          version: remoteVersion,
          projectSlug: PageProps.appSlug(),
          tabOpenDuringSave: currentPage,
        },
        {
          onError: (error) => {
            if (error.status === 409) {
              refetch();
              setNextData({ yourYml: finalYmlEditor.current?.getValue() });
              setClientError(new Error('There are changes outside your current editing session.'));
            }
          },
        },
      );
      segmentTrack('Workflow Editor Config Merge Popup Save Results Button Clicked', {
        tab_name: currentPage,
      });
    } catch (error) {
      setClientError(error as Error);
    }
  };

  return (
    <>
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
                theme="vs-dark"
                language="yaml"
                original={baseYml}
                modified={yourYml}
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
                theme="vs-dark"
                language="yaml"
                original={baseYml}
                modified={mergedYml}
                options={diffEditorOptions}
                keepCurrentModifiedModel
                keepCurrentOriginalModel
                onMount={onFinalYmlEditorMount}
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
                theme="vs-dark"
                language="yaml"
                original={baseYml}
                modified={remoteYml}
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
        {(clientError || saveError) && (
          <Notification status="error">
            <Text textStyle="comp/notification/title">Error saving...</Text>
            <Text>
              {clientError?.message || saveError?.getResponseErrorMessage() || saveError?.message || 'Unknown error'}
            </Text>
          </Notification>
        )}
      </DialogBody>
      <DialogFooter>
        <ButtonGroup spacing={16}>
          <Button variant="secondary" isDisabled={isLoading} onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={isLoading} onClick={handleSave}>
            Save results
          </Button>
        </ButtonGroup>
      </DialogFooter>
    </>
  );
};

const ConfigMergeDialog = ({ isOpen, onClose, ...props }: Props) => {
  const currentPage = useCurrentPage();

  const handleClose = () => {
    onClose();
    segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
      tab_name: currentPage,
      popup_step_dismiss_method: 'close_button',
    });
  };

  return (
    <Dialog
      size="full"
      isOpen={isOpen}
      onClose={handleClose}
      title="Review changes"
      minHeight={['100dvh', 'unset']}
      {...props}
    >
      <ConfigMergeDialogContent onClose={onClose} />
      <style>{`
        .monaco-diff-editor .conflict {
          border: 1px solid rgba(255, 0, 0, 1);
        }
      `}</style>
    </Dialog>
  );
};

export default ConfigMergeDialog;
