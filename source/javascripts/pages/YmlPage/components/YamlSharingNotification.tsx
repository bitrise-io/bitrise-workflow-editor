import { BitkitAlert } from '@bitrise/bitkit-v2';
import { datadogRum } from '@datadog/browser-rum';
import { useState } from 'react';

import { useReadOnlyView } from '@/hooks/useTree';
import useVisualEditorBlocker, { VISUAL_EDITOR_BLOCKERS } from '@/hooks/useVisualEditorBlocker';

import ExpandYamlSharingDialog from './ExpandYamlSharingDialog';

const YamlSharingNotification = () => {
  const isBlocked = useVisualEditorBlocker() === 'yaml-sharing';
  const { isReadOnly } = useReadOnlyView();
  const [isExpandDialogOpen, setIsExpandDialogOpen] = useState(false);

  if (!isBlocked) {
    return null;
  }

  const openExpandDialog = () => {
    datadogRum.addAction('wfe_yaml_sharing_expand_opened');
    setIsExpandDialogOpen(true);
  };

  return (
    <>
      <BitkitAlert
        variant="warning"
        data-clarity-unmask="true"
        titleText={VISUAL_EDITOR_BLOCKERS['yaml-sharing'].title}
        messageText={`It uses YAML aliases (*name) or merge keys (<<), which the Visual editor does not support yet. ${
          isReadOnly ? '' : 'Expand them to use the Visual editor, or keep editing here. '
        }The marked lines show where they are.`}
        action={isReadOnly ? undefined : { label: 'Expand…', onClick: openExpandDialog }}
      />
      <ExpandYamlSharingDialog isOpen={isExpandDialogOpen} onClose={() => setIsExpandDialogOpen(false)} />
    </>
  );
};

export default YamlSharingNotification;
