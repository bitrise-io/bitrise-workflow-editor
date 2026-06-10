import { BitkitAlert } from '@bitrise/bitkit-v2';

import { useReadOnlyView } from '@/hooks/useTree';

/**
 * Blue info banner floating over the Monaco editor (the parent must be `position: relative`)
 * whenever the active view is read-only: the Merged config preview, or a file included from
 * another repo/ref.
 */
const ReadOnlyViewNotification = () => {
  const { isReadOnly, isMergedConfig, sourceLabel } = useReadOnlyView();

  if (!isReadOnly) {
    return null;
  }

  const messageText = isMergedConfig
    ? 'Merged view of the configuration is read-only. You can only edit the module files.'
    : `This file is included from ${sourceLabel ?? 'another repository or ref'} and is read-only.`;

  return (
    <BitkitAlert
      variant="info"
      messageText={messageText}
      position="absolute"
      insetBlockStart="16"
      insetInlineStart="50%"
      transform="translateX(-50%)"
      width="calc(100% - 96px)"
      maxWidth="640px"
      zIndex="100"
      boxShadow="large"
    />
  );
};

export default ReadOnlyViewNotification;
