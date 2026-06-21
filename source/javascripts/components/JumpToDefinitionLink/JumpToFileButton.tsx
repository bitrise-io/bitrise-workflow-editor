import { ControlButton } from '@bitrise/bitkit';

import { openTab, recordActiveTabLocation } from '@/core/stores/BitriseYmlStore';
import { useTree } from '@/hooks/useTree';

import FilePickerPopover from './FilePickerPopover';

type Props = {
  nodeId: string;
};

/**
 * Jump to a known file's tab via a confirm popover. Used by per-file grouped views where the target
 * file is unambiguous (e.g. env var groups) — unlike {@link JumpToDefinitionLink}'s entity-index
 * picker, this is scoped to the one file, but still opens the popover so the user sees which file
 * they'll jump to (and can decide) before committing.
 */
const JumpToFileButton = ({ nodeId }: Props) => {
  const tree = useTree();
  if (!tree) {
    return null;
  }

  return (
    <FilePickerPopover
      rootNode={tree}
      nodeIds={[nodeId]}
      onSelect={(id) => {
        // Record the current tab's page before switching, so returning to it (e.g. the merged tab)
        // restores the right page — mirrors useJumpToDefinition.
        recordActiveTabLocation(window.parent.location.hash);
        openTab(id, { preview: false });
      }}
      trigger={
        <ControlButton
          size="xs"
          iconName="ArrowNorthEast"
          aria-label="Go to definition"
          tooltipProps={{ 'aria-label': 'Go to definition' }}
        />
      }
    />
  );
};

export default JumpToFileButton;
