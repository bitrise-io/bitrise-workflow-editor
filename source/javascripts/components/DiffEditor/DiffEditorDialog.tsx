import { BitkitAlert, BitkitButton, BitkitDialog } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
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
import useMountedWhileOpen from '@/hooks/useMountedWhileOpen';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import YmlValidationBadge from '../YmlValidationBadge';
import DiffEditor, { type Props as DiffEditorProps } from './DiffEditor';

export type DiffEditorDialogProps = {
  isOpen: boolean;
  onClose: VoidFunction;
};

type ContentProps = DiffEditorDialogProps & {
  onExitComplete: VoidFunction;
  nodeId?: string;
  tabs?: ReactNode;
  isReadOnly?: boolean;
};

export const DiffEditorDialogContent = ({
  isOpen,
  onClose,
  onExitComplete,
  nodeId,
  tabs,
  isReadOnly,
}: ContentProps) => {
  // useModelValidationStatus only accepts 'valid' | 'invalid' | 'warnings'; map the new
  // 'pending' seed to 'valid' (the diff editor recomputes its own status from markers anyway).
  const seedStatus = useYmlValidationStatus();
  const [ymlStatus, subscribeToModel] = useModelValidationStatus(seedStatus === 'pending' ? 'valid' : seedStatus);
  const [currentText, setCurrentText] = useState<string | undefined>();

  useEffect(() => {
    setCurrentText(undefined);
  }, [nodeId]);

  // The merged tab diffs the saved vs. current merged config (read-only); file tabs diff that file's slice.
  const isMerged = nodeId === MERGED_CONFIG_NODE_ID;
  const mergedOriginalText = useBitriseYmlStore((s) => s.savedMergedYml ?? '');
  const mergedModifiedText = useBitriseYmlStore((s) => s.mergedYml ?? '');

  const fileTexts = useMemo(() => {
    if (!nodeId || isMerged) {
      return undefined;
    }
    const slice = bitriseYmlStore.getState().files[nodeId];
    return {
      originalText: slice ? YmlUtils.toYml(slice.savedYmlDocument) : '',
      modifiedText: slice ? YmlUtils.toYml(slice.ymlDocument) : '',
    };
  }, [nodeId, isMerged]);

  const modifiedText = isMerged ? mergedModifiedText : fileTexts ? fileTexts.modifiedText : getYmlString();
  const originalText = isMerged
    ? mergedOriginalText
    : fileTexts
      ? fileTexts.originalText
      : getYmlString('savedYmlDocument');

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
    <BitkitDialog
      size="full"
      title={
        <Box as="span" display="flex" gap="16" alignItems="center">
          View and edit YAML changes
          <YmlValidationBadge status={ymlStatus} />
        </Box>
      }
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      onExitComplete={onExitComplete}
      footerButtons={
        <>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton
            state={isApplyChangesDisabled ? 'disabled' : undefined}
            disabledReason={
              ymlStatus === 'invalid' ? 'YAML is invalid, please fix it before applying changes' : undefined
            }
            onClick={applyChanges}
          >
            Apply changes
          </BitkitButton>
        </>
      }
    >
      <BitkitAlert
        variant="info"
        messageText={
          tabs
            ? 'For the merged config you can only view your changes. For each module you can edit the right side of the diff view, and your changes will be applied.'
            : isReadOnly
              ? 'This file is read-only — changes here cannot be applied.'
              : 'You can edit the right side of the diff view, and your changes will be applied.'
        }
      />
      {tabs}
      <Box flex="1" display="flex" flexDirection="column" gap="16" minWidth="0">
        <DiffEditor
          key={nodeId ?? 'legacy'}
          originalText={originalText}
          modifiedText={modifiedText}
          onChange={setCurrentText}
          onMount={handleEditorMount}
          readOnly={isReadOnly}
        />
      </Box>
    </BitkitDialog>
  );
};

// The legacy (non-modular) diff dialog: a single document diff, no file tabs.
const DiffEditorDialog = ({ isOpen, onClose, nodeId }: DiffEditorDialogProps & { nodeId?: string }) => {
  const { isMounted, onExitComplete } = useMountedWhileOpen(isOpen);

  if (!isMounted) {
    return null;
  }

  return <DiffEditorDialogContent isOpen={isOpen} onClose={onClose} onExitComplete={onExitComplete} nodeId={nodeId} />;
};

export default DiffEditorDialog;
