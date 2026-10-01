import { BitkitAlert } from '@bitrise/bitkit-v2';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useVisualEditorBlocker, { YAML_ALIAS_BLOCKER } from '@/hooks/useVisualEditorBlocker';

/**
 * Why the Visual editor is disabled: aliases or merge keys warn, YAML that doesn't parse is critical.
 * YAML that stops parsing mid-typing gets no alert: it would mount and unmount on every keystroke,
 * shifting the editor, and the editor already marks the error inline.
 */
const VisualEditorBlockedNotification = () => {
  const visualEditorBlocker = useVisualEditorBlocker();
  const loadedInvalid = useBitriseYmlStore((s) => s.__savedInvalidYmlString !== undefined);

  if (!visualEditorBlocker || (visualEditorBlocker !== YAML_ALIAS_BLOCKER && !loadedInvalid)) {
    return null;
  }

  return (
    <BitkitAlert
      variant={visualEditorBlocker.severity}
      data-clarity-unmask="true"
      titleText={visualEditorBlocker.title}
      messageText={visualEditorBlocker.description}
    />
  );
};

export default VisualEditorBlockedNotification;
