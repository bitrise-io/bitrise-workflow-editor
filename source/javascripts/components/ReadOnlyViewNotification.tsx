import { BitkitAlert } from '@bitrise/bitkit-v2';
import { useState } from 'react';

import { useReadOnlyView, useSelectedNodeId } from '@/hooks/useTree';

const ReadOnlyViewNotification = () => {
  const { isReadOnly, isMergedConfig } = useReadOnlyView();
  const selectedNodeId = useSelectedNodeId();
  const [dismissedNodeId, setDismissedNodeId] = useState<string>();

  if (!isReadOnly || dismissedNodeId === selectedNodeId) {
    return null;
  }

  const messageText = isMergedConfig
    ? 'Merged view of the configuration is read-only. You can only edit the module files.'
    : 'Files included from another repository, branch, tag or commit are read-only.';

  return (
    <BitkitAlert
      variant="info"
      messageText={messageText}
      dismissible
      onClose={() => setDismissedNodeId(selectedNodeId)}
      position="absolute"
      // The YmlPage editor wrapper already has 12px block padding, so flush-top lands 12px below the tab bar.
      insetBlockStart="0"
      insetInlineStart="50%"
      transform="translateX(-50%)"
      width="600px"
      zIndex="100"
      boxShadow="large"
    />
  );
};

export default ReadOnlyViewNotification;
