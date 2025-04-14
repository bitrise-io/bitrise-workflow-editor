import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Box, Dialog, DialogBody, DialogProps, Notification, Text } from '@bitrise/bitkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { updateYmlStringAndSyncYml } from '@/core/stores/BitriseYmlStore';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import useCurrentPage from '@/hooks/useCurrentPage';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import DiffEditor from './DiffEditor';

const DiffEditorDialogBody = forwardRef((_, ref) => {
  useImperativeHandle(ref, () => ({ trySaveChanges }));
  const currentPage = useCurrentPage();
  const originalText = useBitriseYmlStore((s) => s.savedYmlString);
  const [modifiedText, setModifiedText] = useState(useBitriseYmlStore((s) => s.ymlString));
  const [errorMessage, setErrorMessage] = useState<string>('');

  const trySaveChanges = () => {
    try {
      BitriseYmlApi.fromYml(modifiedText);
      updateYmlStringAndSyncYml(modifiedText);
      return modifiedText;
    } catch (error) {
      setErrorMessage(`Invalid YML format: ${(error as Error)?.message}`);
      segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
        tab_name: currentPage,
        source: 'diff',
      });
    }
  };

  return (
    <Box display="flex" gap="16" flexDirection="column" height="calc(100% - 32px)">
      <Notification status="info">
        You can edit the right side of the diff view, and your changes will be saved
      </Notification>
      {errorMessage && (
        <Notification status="error">
          <Text textStyle="comp/notification/title">Error saving...</Text>
          <Text>{errorMessage}</Text>
        </Notification>
      )}
      <Box flex="1">
        <DiffEditor originalText={originalText} modifiedText={modifiedText} onChange={setModifiedText} />
      </Box>
    </Box>
  );
});

const DiffEditorDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  const bodyRef = useRef<{ trySaveChanges: () => string | undefined }>(null);
  const handleClose = () => {
    const result = bodyRef.current?.trySaveChanges();
    if (result) {
      onClose?.();
    }
  };

  return (
    <Dialog {...rest} onClose={handleClose} title="View and edit YAML changes" size="full">
      <DialogBody>
        <DiffEditorDialogBody ref={bodyRef} />
      </DialogBody>
    </Dialog>
  );
};

export default DiffEditorDialog;
