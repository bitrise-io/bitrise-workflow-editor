import { BitkitAlert } from '@bitrise/bitkit-v2';

import { useReadOnlyView } from '@/hooks/useTree';

const ReadOnlyViewNotification = () => {
  const { isReadOnly, isMergedConfig } = useReadOnlyView();

  if (!isReadOnly) {
    return null;
  }

  const messageText = isMergedConfig
    ? 'Merged view of the configuration is read-only. You can only edit the module files.'
    : 'Files included from another repository, branch, tag or commit are read-only.';

  // A permanent reminder of why the view is read-only — neither the merged view nor a cross-repo/ref
  // file can be edited for the whole time it's open, so the banner isn't dismissible (BIVS-3732).
  return (
    <BitkitAlert
      variant="info"
      messageText={messageText}
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
