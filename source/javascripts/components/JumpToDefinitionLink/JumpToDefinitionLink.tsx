import { BitkitLinkButton, IconChevronDown } from '@bitrise/bitkit-v2';
import { ReactElement, useCallback, useMemo } from 'react';

import { EntityKind } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import { useTree } from '@/hooks/useTree';

import FilePickerMenu from './FilePickerMenu';

type Props = {
  kind: EntityKind;
  id: string;
  /** Restrict the picker to these files; defaults to every file that defines the entity. */
  nodeIds?: string[];
  trigger?: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * Opens a {@link FilePickerMenu} over the files that define a cross-file entity — the node set is
 * derived from the entity index (or the caller-supplied `nodeIds`), and selecting a layer jumps
 * there. The explicit `nodeId`-driven counterpart is {@link JumpToFileButton}.
 */
const JumpToDefinitionLink = ({ kind, id, nodeIds, trigger, onOpenChange }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();

  const definitionNodeIds = useMemo(
    () => nodeIds ?? EntityIndexService.definitionsOf(entityIndex, kind, id).map((def) => def.nodeId),
    [nodeIds, entityIndex, kind, id],
  );

  const handleSelect = useCallback(
    (nodeId: string) => jumpToDefinition(kind, id, nodeId),
    [jumpToDefinition, kind, id],
  );

  if (!tree) {
    return null;
  }

  return (
    <FilePickerMenu
      rootNode={tree}
      nodeIds={definitionNodeIds}
      onSelect={handleSelect}
      onOpenChange={onOpenChange}
      trigger={
        // size="sm" to match the body/sm provenance subtitle it sits in (default is md → too big).
        trigger ?? (
          <BitkitLinkButton size="sm" suffixIcon={IconChevronDown}>
            Edit definition
          </BitkitLinkButton>
        )
      }
    />
  );
};

export default JumpToDefinitionLink;
