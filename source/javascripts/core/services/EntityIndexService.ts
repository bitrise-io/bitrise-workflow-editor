import { EntityIndex, EntityKind } from '@/core/models/Tree';

/**
 * Read helpers over the BE-served `entity_index`. Both are O(1) lookups — no
 * tree walking, no per-file YAML re-parse. The index is the single source of
 * truth for "which node defines which entity"; the FE never walks files to
 * answer that itself.
 */

/** The `nodeId` of the node that defines this entity, or `undefined`. */
function definingNodeId(index: EntityIndex, kind: EntityKind, id: string): string | undefined {
  return index[kind]?.[id]?.nodeId;
}

/**
 * `true` when the entity is defined in a node other than the one the editor is
 * currently scoped to (a "ghost" reference). `false` when it's defined in the
 * current node, or when the index doesn't know about it at all.
 */
function isGhost(index: EntityIndex, kind: EntityKind, id: string, currentNodeId: string): boolean {
  const definingId = definingNodeId(index, kind, id);
  return definingId !== undefined && definingId !== currentNodeId;
}

export default {
  definingNodeId,
  isGhost,
};
