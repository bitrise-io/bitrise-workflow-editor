import { Dialog, DialogBody, DialogProps, Icon, Notification, Text } from '@bitrise/bitkit';
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import DiffEditor from './DiffEditor';

const MergedDiffDialogBody = () => {
  const mergedYml = useBitriseYmlStore((s) => s.mergedYml) ?? '';
  const savedMergedYml = useBitriseYmlStore((s) => s.savedMergedYml) ?? '';

  return (
    <>
      <ModalHeader>
        <Text as="h1" textStyle="comp/dialog/title">
          Merged configuration changes
        </Text>
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
      <DialogBody flex="1" display="flex" gap="16" flexDirection="column">
        <Notification status="info">
          The merged configuration as built from your saved files (left) vs. your current unsaved changes (right). This
          view is read-only.
        </Notification>
        <DiffEditor readOnly originalText={savedMergedYml} modifiedText={mergedYml} onChange={() => {}} />
      </DialogBody>
    </>
  );
};

/**
 * Read-only diff of the merged configuration: the merge of the saved files
 * (`savedMergedYml`) vs. the merge of the current edited files (`mergedYml`).
 * Opened from the per-tab "Show diff" button while the Merged Config tab is
 * active — it shows the net effect of all unsaved edits on the merged result.
 */
const MergedDiffDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <Dialog {...rest} variant="empty" title="" size="full" onClose={onClose} minHeight={['100dvh', 'unset']}>
      <MergedDiffDialogBody />
    </Dialog>
  );
};

export default MergedDiffDialog;
