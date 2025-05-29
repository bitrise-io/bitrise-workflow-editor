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
import { ModalCloseButton, ModalHeader } from '@chakra-ui/react';
import { DiffEditor, DiffEditorProps, MonacoDiffEditor } from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';
import { toMerged } from 'es-toolkit';
import type { editor } from 'monaco-editor';
import { diff3Merge } from 'node-diff3';
import { useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { forceRefreshStates, getYmlString, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import PageProps from '@/core/utils/PageProps';
import YmlUtils from '@/core/utils/YmlUtils';
import { useSaveCiConfig } from '@/hooks/useCiConfig';
import useCurrentPage from '@/hooks/useCurrentPage';

import YmlValidationBadge from '../YmlValidationBadge';

type Props = Omit<DialogProps, 'title'>;

const diffEditorOptions: DiffEditorProps['options'] = {
  diffWordWrap: 'off',
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

const readOnlyDiffEditorOptions: DiffEditorProps['options'] = {
  ...diffEditorOptions,
  readOnly: true,
};

function mergeYamls(yourYaml: string, baseYaml: string, remoteYaml: string) {
  const rows: string[] = [];
  const decorations: editor.IModelDeltaDecoration[] = [];

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

  type Response = {
    yourYml: string;
    baseYml: string;
    remoteYml: string;
    remoteVersion: string;
  };

  return useQuery<Response, ClientError>({
    queryKey: ['initial-ci-configs', projectSlug],
    queryFn: async ({ signal }) => {
      return {
        yourYml: getYmlString(),
        baseYml: getYmlString('savedYmlDocument'),
        ...(await BitriseYmlApi.getCiConfig({ projectSlug, signal }).then(async (res) => ({
          remoteYml: res.ymlString,
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
  const [ymlStatus, setYmlStatus] = useState<'invalid' | 'valid' | 'warnings'>('valid');
  const [nextData, setNextData] = useState<Partial<ReturnType<typeof useInitialCiConfigs>['data']>>();

  const {
    error: saveError,
    mutate: saveCiConfig,
    isPending: isSaving,
  } = useSaveCiConfig({
    onSuccess: ({ ymlString, version }) => {
      initializeBitriseYmlDocument({ ymlString, version });
      forceRefreshStates();
      onClose();
    },
  });

  const isLoading = isSaving || isFetching;
  const { yourYml = '', baseYml = '', remoteYml = '', remoteVersion } = toMerged(data ?? {}, nextData ?? {});
  const { mergedYml, decorations } = mergeYamls(yourYml, baseYml, remoteYml);

  const calculateAndSetYmlStatus = (ymlString?: string) => {
    if (ymlString) {
      const doc = YmlUtils.toDoc(ymlString);
      if (doc.errors.length > 0) {
        setYmlStatus('invalid');
      } else if (doc.warnings.length > 0) {
        setYmlStatus('warnings');
      } else {
        setYmlStatus('valid');
      }
    }
  };

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

      calculateAndSetYmlStatus(finalYmlEditor.current?.getValue());
    });

    editor.createDecorationsCollection(decorations);

    calculateAndSetYmlStatus(finalYmlEditor.current?.getValue());
  };

  const handleCancel = () => {
    onClose();
    segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
      tab_name: currentPage,
      popup_step_dismiss_method: 'close_button',
    });
  };

  const handleSave = () => {
    const ymlString = finalYmlEditor.current?.getValue();

    if (!ymlString) {
      return;
    }

    try {
      setClientError(undefined);
      saveCiConfig(
        {
          ymlString,
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

  useEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();

        if (ymlStatus !== 'invalid') {
          handleSave();
        }
      }
    },
    undefined,
    { capture: true },
  );

  if (isFetching) {
    return <LoadingState />;
  }

  if (initialError || !data) {
    return (
      <Box px="32">
        <Notification status="error">
          <Text textStyle="comp/notification/title">Error fetching initial configs</Text>
          <Text>{initialError?.message || 'Initial configs not found'}</Text>
        </Notification>
      </Box>
    );
  }

  return (
    <>
      <ModalHeader display="flex" gap="16" alignItems="center">
        <Text as="h1" textStyle="comp/dialog/title">
          Review changes
        </Text>
        <YmlValidationBadge status={ymlStatus} />
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
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
                beforeMount={(monaco) => {
                  MonacoUtils.configureForYaml(monaco);
                }}
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
                beforeMount={(monaco) => {
                  MonacoUtils.configureForYaml(monaco);
                  MonacoUtils.configureEnvVarsCompletionProvider(monaco);
                }}
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
                beforeMount={(monaco) => {
                  MonacoUtils.configureForYaml(monaco);
                }}
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
          <Tooltip
            placement="top-end"
            isDisabled={ymlStatus !== 'invalid'}
            label="YAML is invalid, please fix it before applying changes"
          >
            <Button variant="primary" isLoading={isLoading} isDisabled={ymlStatus === 'invalid'} onClick={handleSave}>
              Save results
            </Button>
          </Tooltip>
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
      {...props}
      title=""
      size="full"
      isOpen={isOpen}
      variant="empty"
      onClose={handleClose}
      minHeight={['100dvh', 'unset']}
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
