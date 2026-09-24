import { BitkitAlert } from '@bitrise/bitkit-v2';
import { datadogRum } from '@datadog/browser-rum';
import { useState } from 'react';

import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useReadOnlyView } from '@/hooks/useTree';
import useVisualEditorBlocker, {
  getVisualEditorBlockerMessage,
  useYamlAliasFilePaths,
} from '@/hooks/useVisualEditorBlocker';

import ExpandYamlSharingDialog from './ExpandYamlSharingDialog';

const YamlSharingNotification = () => {
  const isBlocked = useVisualEditorBlocker() === 'yaml-alias';
  const paths = useYamlAliasFilePaths();
  const openFileUsesSharing = useBitriseYmlStore((s) => YmlUtils.usesYamlSharing(s.ymlDocument));
  const { isReadOnly } = useReadOnlyView();
  const [isExpandDialogOpen, setIsExpandDialogOpen] = useState(false);

  if (!isBlocked) {
    return null;
  }

  // Expand rewrites the open file only, so it's offered only where it would change something.
  const canExpand = openFileUsesSharing && !isReadOnly;
  const openExpandDialog = () => {
    datadogRum.addAction('wfe_yaml_sharing_expand_opened');
    setIsExpandDialogOpen(true);
  };

  const unsupported = 'YAML aliases (*name) or merge keys (<<), which the Visual editor does not support yet';
  const subject = paths.length > 0 ? `${paths.join(', ')} ${paths.length === 1 ? 'uses' : 'use'}` : 'It uses';
  const next = canExpand
    ? 'Expand them to use the Visual editor, or keep editing here. The marked lines show where they are.'
    : 'You can keep editing it here, and the marked lines show where they are.';

  return (
    <>
      <BitkitAlert
        variant="warning"
        data-clarity-unmask="true"
        titleText={getVisualEditorBlockerMessage('yaml-alias').title}
        messageText={`${subject} ${unsupported}. ${next}`}
        action={canExpand ? { label: 'Expand…', onClick: openExpandDialog } : undefined}
      />
      <ExpandYamlSharingDialog isOpen={isExpandDialogOpen} onClose={() => setIsExpandDialogOpen(false)} />
    </>
  );
};

export default YamlSharingNotification;
