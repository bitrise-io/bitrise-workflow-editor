import { Box, Dialog, DialogBody, DialogProps, Notification } from '@bitrise/bitkit';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { updateYmlString } from '@/core/stores/BitriseYmlStore';
import DiffEditor from './DiffEditor';

const DiffEditorDialog = (props: Omit<DialogProps, 'title'>) => {
  const modifiedText = useBitriseYmlStore((s) => s.ymlString);
  const originalText = useBitriseYmlStore((s) => s.savedYmlString);

  return (
    <Dialog {...props} title="View and edit YAML changes" size="full">
      <DialogBody>
        <Notification status="info">
          You can edit the right side of the diff view, and your changes will be saved
        </Notification>
        <Box mt="16" height="calc(100% - 96px)">
          <DiffEditor originalText={originalText} modifiedText={modifiedText} onChange={updateYmlString} />
        </Box>
      </DialogBody>
    </Dialog>
  );
};

export default DiffEditorDialog;
