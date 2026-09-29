import { BitkitAlert } from '@bitrise/bitkit-v2';

import useVisualEditorBlocker, {
  getVisualEditorBlockerMessage,
  useYamlAliasFilePaths,
} from '@/hooks/useVisualEditorBlocker';

const YamlSharingNotification = () => {
  const isBlocked = useVisualEditorBlocker() === 'yaml-alias';
  const paths = useYamlAliasFilePaths();

  if (!isBlocked) {
    return null;
  }

  const unsupported = 'YAML aliases (*name) or merge keys (<<), which the Visual editor does not support yet';
  return (
    <BitkitAlert
      variant="warning"
      data-clarity-unmask="true"
      titleText={getVisualEditorBlockerMessage('yaml-alias').title}
      messageText={
        paths.length > 0
          ? `${paths.join(', ')} ${paths.length === 1 ? 'uses' : 'use'} ${unsupported}. You can keep editing every file here.`
          : `It uses ${unsupported}. You can keep editing it here.`
      }
    />
  );
};

export default YamlSharingNotification;
