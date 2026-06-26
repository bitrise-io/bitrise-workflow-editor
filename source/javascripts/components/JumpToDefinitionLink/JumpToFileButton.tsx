import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';

import { openTab, recordActiveTabLocation } from '@/core/stores/BitriseYmlStore';
import { useTree } from '@/hooks/useTree';

import FilePickerMenu from './FilePickerMenu';

type Props = {
  nodeId: string;
};

/**
 * Jump to a known file's tab via a confirm menu. Used by per-file grouped views where the target
 * file is unambiguous (e.g. env var groups) — unlike {@link JumpToDefinitionLink}'s entity-index
 * picker, this is scoped to the one file, but still opens the menu so the user sees which file
 * they'll jump to (and can decide) before committing.
 */
const JumpToFileButton = ({ nodeId }: Props) => {
  const tree = useTree();
  if (!tree) {
    return null;
  }

  return (
    <FilePickerMenu
      rootNode={tree}
      nodeIds={[nodeId]}
      onSelect={(id) => {
        // Record the current tab's page before switching, so returning to it (e.g. the merged tab)
        // restores the right page — mirrors useJumpToDefinition.
        recordActiveTabLocation(window.parent.location.hash);
        openTab(id, { preview: false });
      }}
      trigger={<BitkitControlButton size="xs" icon={IconArrowNortheast} label="Go to definition" />}
    />
  );
};

export default JumpToFileButton;
