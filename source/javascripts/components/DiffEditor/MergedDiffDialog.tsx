import { Dialog, DialogBody, DialogProps, Notification } from '@bitrise/bitkit';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import DiffEditor from './DiffEditor';

const MergedDiffDialogBody = () => {
  const mergedYml = useBitriseYmlStore((s) => s.mergedYml) ?? '';
  const savedMergedYml = useBitriseYmlStore((s) => s.savedMergedYml) ?? '';

  return (
    <DialogBody flex="1" display="flex" gap="16" flexDirection="column">
      <Notification status="info">
        The merged configuration as built from your saved files (left) vs. your current unsaved changes (right). This
        view is read-only.
      </Notification>
      <DiffEditor readOnly originalText={savedMergedYml} modifiedText={mergedYml} onChange={() => {}} />
    </DialogBody>
  );
};

const MergedDiffDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  return (
    <Dialog
      {...rest}
      title="Merged configuration changes"
      size="full"
      onClose={onClose}
      minHeight={['100dvh', 'unset']}
    >
      <MergedDiffDialogBody />
    </Dialog>
  );
};

export default MergedDiffDialog;
