import { BitkitAlert } from '@bitrise/bitkit-v2';

import useVisualEditorBlocker, { VISUAL_EDITOR_BLOCKERS } from '@/hooks/useVisualEditorBlocker';

const YamlSharingNotification = () => {
  if (useVisualEditorBlocker() !== 'yaml-sharing') {
    return null;
  }

  return (
    <BitkitAlert
      variant="warning"
      data-clarity-unmask="true"
      titleText={VISUAL_EDITOR_BLOCKERS['yaml-sharing'].title}
      messageText="It uses YAML aliases (*name) or merge keys (<<), which the Visual editor does not support yet. You can keep editing it here, and the marked lines show where they are."
    />
  );
};

export default YamlSharingNotification;
