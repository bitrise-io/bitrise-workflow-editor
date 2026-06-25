import { BitkitLinkButton } from '@bitrise/bitkit-v2';
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
  /** Label for the default link trigger. Ignored when a custom `trigger` is provided. */
  children?: string;
  trigger?: ReactElement<{ onClick?: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * Opens a {@link FilePickerMenu} over the files that define a cross-file entity — the node set is
 * derived from the entity index, and selecting a layer jumps to that definition. The explicit
 * `nodeId`-driven counterpart is {@link JumpToFileButton}.
 */
const JumpToDefinitionLink = ({ kind, id, children, trigger, onOpenChange }: Props) => {
  const tree = useTree();
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();

  const definitionNodeIds = useMemo(
    () => EntityIndexService.definitionsOf(entityIndex, kind, id).map((def) => def.nodeId),
    [entityIndex, kind, id],
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
      trigger={trigger ?? <BitkitLinkButton>{children ?? ''}</BitkitLinkButton>}
    />
  );
};

export default JumpToDefinitionLink;
