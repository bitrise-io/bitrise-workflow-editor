import { BitkitAlert } from '@bitrise/bitkit-v2';

import { configDocuments } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useVisualEditorNotice, { PARSE_ERROR_NOTICE, YAML_ALIAS_NOTICE } from '@/hooks/useVisualEditorNotice';

/**
 * YAML loaded invalid is critical; aliases or merge keys warn. YAML that stops parsing mid-typing gets
 * no alert of its own: it would mount and unmount on every keystroke, shifting the editor, and the
 * editor already marks the error inline. The alias alert stays up meanwhile, read from the documents,
 * which keep their last parse.
 */
const VisualEditorNotification = () => {
  const visualEditorNotice = useVisualEditorNotice();
  const loadedInvalid = useBitriseYmlStore((s) => s.__savedInvalidYmlString !== undefined);
  const hasAliases = useBitriseYmlStore((s) => configDocuments(s).some(YmlUtils.hasAliasesOrMergeKeys));
  // In a modular config the aliases can be in a file other than the open one.
  const aliasedFiles = useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => YmlUtils.hasAliasesOrMergeKeys(file.ymlDocument))
      .map((file) => file.path),
  );

  const notice =
    visualEditorNotice === PARSE_ERROR_NOTICE && loadedInvalid ? PARSE_ERROR_NOTICE : hasAliases && YAML_ALIAS_NOTICE;
  if (!notice) {
    return null;
  }

  return (
    <BitkitAlert
      variant={notice.severity}
      data-clarity-unmask="true"
      titleText={notice.title}
      messageText={
        notice === YAML_ALIAS_NOTICE && aliasedFiles.length > 0 ? (
          <>
            {notice.description} Found in{' '}
            {/* The alert is unmasked for Clarity, but file paths are customer data, so they stay masked. */}
            <span data-clarity-mask="true">{aliasedFiles.join(', ')}</span>.
          </>
        ) : (
          notice.description
        )
      }
    />
  );
};

export default VisualEditorNotification;
