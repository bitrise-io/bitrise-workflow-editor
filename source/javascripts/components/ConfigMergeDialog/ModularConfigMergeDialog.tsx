import { Box, Button, ButtonGroup, DialogBody, DialogFooter, Icon, Notification, Text, Tooltip } from '@bitrise/bitkit';
import { BitkitTabs } from '@bitrise/bitkit-v2';
import { DiffEditor, MonacoDiffEditor } from '@monaco-editor/react';
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';
import type { editor, IDisposable } from 'monaco-editor';
import { useMemo, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { PushBranchConflict } from '@/core/api/BranchesApi';
import TreeService from '@/core/services/TreeService';
import { getFileSlice, updateFileDocumentByString } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import usePushBranch from '@/hooks/usePushBranch';

import { DiffEditorDialogShell } from '../DiffEditor/DiffEditorDialog';
import { diffEditorOptions, mergeYamls, readOnlyDiffEditorOptions } from './mergeYamls';

type Props = {
  isOpen: boolean;
  onClose: VoidFunction;
  branch: string;
  message: string;
  conflict: PushBranchConflict;
};

/** Per-file 3-way merge state derived once from the conflict + the local file slice. */
type FileMerge = {
  nodeId: string;
  path: string;
  name: string;
  yourYml: string;
  baseYml: string;
  remoteYml: string;
  mergedYml: string;
  decorations: editor.IModelDeltaDecoration[];
};

/** A file's auto-merged result is valid YAML iff parsing it yields no errors. */
function isMergedYmlValid(mergedYml: string): boolean {
  return YmlUtils.toDoc(mergedYml).errors.length === 0;
}

/** Seed per-file validity from the up-front parse so unvisited tabs still gate Apply. */
function seedValidity(fileMerges: FileMerge[]): Record<string, 'valid' | 'invalid' | 'warnings'> {
  return Object.fromEntries(fileMerges.map((f) => [f.nodeId, isMergedYmlValid(f.mergedYml) ? 'valid' : 'invalid']));
}

function buildFileMerges(conflict: PushBranchConflict): FileMerge[] {
  // The BE may list the same file more than once; dedupe by node_id so each
  // conflicting file gets exactly one tab (tab value/selection keys off node_id).
  const seen = new Set<string>();
  const uniqueFiles = conflict.conflicts.filter((file) => {
    if (seen.has(file.nodeId)) {
      return false;
    }
    seen.add(file.nodeId);
    return true;
  });

  return uniqueFiles.map((file) => {
    const slice = getFileSlice(file.nodeId);
    const yourYml = slice ? YmlUtils.toYml(slice.ymlDocument) : '';
    const baseYml = slice ? YmlUtils.toYml(slice.savedYmlDocument) : '';
    const { mergedYml, decorations } = mergeYamls(yourYml, baseYml, file.remoteYml);

    return {
      nodeId: file.nodeId,
      path: file.path,
      name: TreeService.fileName(file.path),
      yourYml,
      baseYml,
      remoteYml: file.remoteYml,
      mergedYml,
      decorations,
    };
  });
}

const ModularConfigMergeDialogBody = ({
  onClose,
  branch,
  message,
  initialConflict,
}: {
  onClose: VoidFunction;
  branch: string;
  message: string;
  initialConflict: PushBranchConflict;
}) => {
  // Held in state so a nested conflict (someone pushed again while resolving) can
  // replace the whole set and re-seed the per-file merges from the new remote.
  const [conflict, setConflict] = useState(initialConflict);
  const fileMerges = useMemo(() => buildFileMerges(conflict), [conflict]);

  const [selectedTab, setSelectedTab] = useState(fileMerges[0]?.nodeId ?? '');
  const effectiveTab = fileMerges.some((f) => f.nodeId === selectedTab) ? selectedTab : (fileMerges[0]?.nodeId ?? '');
  const activeMerge = fileMerges.find((f) => f.nodeId === effectiveTab);

  // Resolved text + validity per file, keyed by node_id. Seeded from each file's
  // auto-merge so unvisited tabs still contribute their merged result on apply.
  const [resolved, setResolved] = useState<Record<string, string>>(() =>
    Object.fromEntries(fileMerges.map((f) => [f.nodeId, f.mergedYml])),
  );
  const [validity, setValidity] = useState<Record<string, 'valid' | 'invalid' | 'warnings'>>(() =>
    seedValidity(fileMerges),
  );
  // Files the user has edited — skip re-decorating them when their tab remounts.
  const touched = useRef<Set<string>>(new Set());
  const [clientError, setClientError] = useState<string>();

  const seedFromConflict = (next: PushBranchConflict) => {
    const merges = buildFileMerges(next);
    setConflict(next);
    setResolved(Object.fromEntries(merges.map((f) => [f.nodeId, f.mergedYml])));
    setValidity(seedValidity(merges));
    touched.current = new Set();
    setSelectedTab(merges[0]?.nodeId ?? '');
  };

  const { isPushPending, pushBranch } = usePushBranch({
    onSuccess: onClose,
    onMergeConflict: (_branch, nextConflict) => {
      if (nextConflict) {
        setClientError('There are changes outside your current editing session. Review and resolve them again.');
        seedFromConflict(nextConflict);
      } else {
        setClientError('Failed to push the resolved changes. Please try again.');
      }
    },
  });

  const onResultEditorMount = (mountedNodeId: string, decorations: editor.IModelDeltaDecoration[]) => {
    return (diff: MonacoDiffEditor) => {
      const modified = diff.getModifiedEditor();
      // Tab switches remount this editor (its key includes the node_id), so every
      // listener registered here must be disposed on unmount — otherwise the global
      // marker listener (onModelMarkerStatusChange) leaks one per visit and keeps
      // firing setValidity for stale models. Collected here, disposed on dispose.
      const disposables: IDisposable[] = [];

      disposables.push(
        modified.onDidChangeModelContent((e) => {
          touched.current.add(mountedNodeId);
          setResolved((prev) => ({ ...prev, [mountedNodeId]: modified.getValue() }));

          const removable = e.changes.reduce<Set<string>>((acc, c) => {
            for (let i = c.range.startLineNumber; i <= c.range.endLineNumber; i += 1) {
              modified.getLineDecorations(i)?.forEach((d) => {
                if (d.options.blockClassName === 'conflict') {
                  acc.add(d.id);
                }
              });
            }
            return acc;
          }, new Set<string>());
          modified.removeDecorations(Array.from(removable));
        }),
      );

      // Conflict markers are positioned for the pristine auto-merge; once the file
      // is edited those line positions no longer map to the displayed text, so we
      // only (re)apply them while it is untouched — which also restores them when
      // an unedited tab is revisited.
      if (!touched.current.has(mountedNodeId)) {
        diff.createDecorationsCollection(decorations);
      }

      const model = modified.getModel();
      if (model) {
        disposables.push(
          MonacoUtils.onModelMarkerStatusChange(model, (status) =>
            setValidity((prev) => ({ ...prev, [mountedNodeId]: status })),
          ),
        );
      }

      diff.onDidDispose(() => disposables.forEach((d) => d.dispose()));
    };
  };

  const isInvalid = Object.values(validity).some((s) => s === 'invalid');

  const handleApply = () => {
    setClientError(undefined);
    // Write each resolved file back into its slice, then re-push the whole tree
    // based on the branch HEAD we reconciled against (the SHA from the 409).
    conflict.conflicts.forEach((file) => {
      const text = resolved[file.nodeId];
      if (text !== undefined) {
        updateFileDocumentByString(file.nodeId, text);
      }
    });
    pushBranch({ branch, message, baseCommitSha: conflict.commitSha });
  };

  useEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (!isInvalid && !isPushPending) {
          handleApply();
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
          Review changes
        </Text>
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
      <DialogBody flex="1" display="flex" flexDirection="column" gap="16" minHeight="0">
        <Text>
          There are changes outside your current editing session. Review the differences for each of the modules and
          resolve any conflicts to proceed.
        </Text>

        <BitkitTabs.Root value={effectiveTab} onValueChange={({ value }) => setSelectedTab(value)}>
          <BitkitTabs.List>
            {fileMerges.map((file) => (
              <BitkitTabs.Trigger key={file.nodeId} value={file.nodeId}>
                {file.name}
              </BitkitTabs.Trigger>
            ))}
          </BitkitTabs.List>
        </BitkitTabs.Root>

        {activeMerge && (
          <Box display="flex" flex="1" gap="4" minHeight="0">
            <Box display="flex" flexDirection="column" flex="1" gap="4">
              <Text textStyle="body/md/semibold">Your changes</Text>
              <Box flex="1" borderRadius="8" overflow="hidden" bg="rgb(30,30,30)" opacity="0.9">
                <DiffEditor
                  key={`${activeMerge.nodeId}-yours`}
                  theme="vs-dark"
                  language="yaml"
                  original={activeMerge.baseYml}
                  modified={activeMerge.yourYml}
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
                  key={`${activeMerge.nodeId}-results`}
                  theme="vs-dark"
                  language="yaml"
                  original={activeMerge.baseYml}
                  modified={resolved[activeMerge.nodeId] ?? activeMerge.mergedYml}
                  options={diffEditorOptions}
                  keepCurrentModifiedModel
                  keepCurrentOriginalModel
                  onMount={onResultEditorMount(activeMerge.nodeId, activeMerge.decorations)}
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
                  key={`${activeMerge.nodeId}-remote`}
                  theme="vs-dark"
                  language="yaml"
                  original={activeMerge.baseYml}
                  modified={activeMerge.remoteYml}
                  options={readOnlyDiffEditorOptions}
                  keepCurrentModifiedModel
                  keepCurrentOriginalModel
                />
              </Box>
            </Box>
          </Box>
        )}

        <Notification status="info">
          <Text textStyle="comp/notification/title">Merge conflict auto-resolution</Text>
          <Text>
            In case of a conflict, remote changes will take priority over your local changes. To retain your changes,
            edit the results before applying.
          </Text>
        </Notification>
        {clientError && (
          <Notification status="error">
            <Text textStyle="comp/notification/title">Error pushing changes</Text>
            <Text>{clientError}</Text>
          </Notification>
        )}
      </DialogBody>
      <DialogFooter>
        <ButtonGroup spacing={16}>
          <Button variant="secondary" isDisabled={isPushPending} onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
            placement="top-end"
            isDisabled={!isInvalid}
            label="YAML is invalid, please fix it before applying changes"
          >
            <Button variant="primary" isLoading={isPushPending} isDisabled={isInvalid} onClick={handleApply}>
              Apply changes
            </Button>
          </Tooltip>
        </ButtonGroup>
      </DialogFooter>
    </>
  );
};

const ModularConfigMergeDialog = ({ isOpen, onClose, branch, message, conflict }: Props) => {
  return (
    <DiffEditorDialogShell isOpen={isOpen} onClose={onClose}>
      {/* Re-mount the body per branch-HEAD so a fresh conflict set re-seeds cleanly. */}
      <ModularConfigMergeDialogBody
        key={conflict.commitSha}
        onClose={onClose}
        branch={branch}
        message={message}
        initialConflict={conflict}
      />
      <style>{`
        .monaco-diff-editor .conflict {
          border: 1px solid rgba(255, 0, 0, 1);
        }
      `}</style>
    </DiffEditorDialogShell>
  );
};

export default ModularConfigMergeDialog;
