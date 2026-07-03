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
  /**
   * Override the file set to jump to. Defaults to the entity's definition files (from the entity
   * index). Pass explicit nodes to jump to where the entity is *used* rather than defined — e.g. the
   * container usage screen jumps to the module file that references the container, not the workflow's
   * top-most definition.
   */
  nodeIds?: string[];
  trigger?: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * Opens a {@link FilePickerMenu} over the files that define a cross-file entity — the node set is
 * derived from the entity index (or the `nodeIds` override), and selecting a layer jumps there. The
 * explicit `nodeId`-driven counterpart is {@link JumpToFileButton}.
 */
const JumpToDefinitionLink = ({ kind, id, nodeIds, trigger, onOpenChange }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();

  const definitionNodeIds = useMemo(
    () => EntityIndexService.definitionsOf(entityIndex, kind, id).map((def) => def.nodeId),
    [entityIndex, kind, id],
  );

  const targetNodeIds = nodeIds ?? definitionNodeIds;

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
      nodeIds={targetNodeIds}
      onSelect={handleSelect}
      onOpenChange={onOpenChange}
      trigger={trigger ?? <BitkitLinkButton suffixIcon={IconChevronDown}>Edit definition</BitkitLinkButton>}
    />
  );
};

export default JumpToDefinitionLink;
