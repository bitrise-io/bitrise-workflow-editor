import { BitkitAlert } from '@bitrise/bitkit-v2';

import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useVisualEditorBlocker, { YAML_ALIAS_BLOCKER } from '@/hooks/useVisualEditorBlocker';

/**
 * Why the Visual editor is disabled: aliases or merge keys warn, YAML that doesn't parse is critical.
 * YAML that stops parsing mid-typing gets no alert: it would mount and unmount on every keystroke,
 * shifting the editor, and the editor already marks the error inline.
 */
const VisualEditorBlockedNotification = () => {
  const visualEditorBlocker = useVisualEditorBlocker();
  const loadedInvalid = useBitriseYmlStore((s) => s.savedYmlDocument.errors.length > 0);
  // In a modular config the aliases can be in a file other than the open one.
  const aliasedFiles = useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => YmlUtils.hasAliasesOrMergeKeys(file.ymlDocument))
      .map((file) => file.path),
  );

  if (!visualEditorBlocker || (visualEditorBlocker !== YAML_ALIAS_BLOCKER && !loadedInvalid)) {
    return null;
  }

  return (
    <BitkitAlert
      variant={visualEditorBlocker.severity}
      data-clarity-unmask="true"
      titleText={visualEditorBlocker.title}
      messageText={
        visualEditorBlocker === YAML_ALIAS_BLOCKER && aliasedFiles.length > 0 ? (
          <>
            {visualEditorBlocker.description} Found in{' '}
            {/* The alert is unmasked for Clarity, but file paths are customer data, so they stay masked. */}
            <span data-clarity-mask="true">{aliasedFiles.join(', ')}</span>.
          </>
        ) : (
          visualEditorBlocker.description
        )
      }
    />
  );
};

export default VisualEditorBlockedNotification;
