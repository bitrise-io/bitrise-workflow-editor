import { Document } from 'yaml';

import { EntityIndex, EntityKind, TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import TreeService from './TreeService';

/**
 * Read helpers over the `entity_index`. The lookups are O(1) — no tree walking,
 * no per-file YAML re-parse. The index is the single source of truth for "which
 * node defines which entity"; the FE never walks files to answer that per-call.
 *
 * The index itself is derived live from the open file documents (`buildFromFiles`)
 * rather than relying solely on the BE snapshot, so unsaved in-memory edits (a
 * workflow just added to a module file) are reflected immediately.
 */

// YAML section key → EntityIndex key. step_bundles is camelCased in the index.
const KIND_SECTIONS: ReadonlyArray<{ section: string; key: EntityKind }> = [
  { section: 'workflows', key: 'workflows' },
  { section: 'pipelines', key: 'pipelines' },
  { section: 'step_bundles', key: 'stepBundles' },
];

/** The `nodeId` of the node that defines this entity, or `undefined`. */
function definingNodeId(index: EntityIndex, kind: EntityKind, id: string): string | undefined {
  return index[kind]?.[id]?.nodeId;
}

/**
 * Build the entity index live from the open file documents — the FE equivalent
 * of the BE `EntityIndexBuilder`. Mirrors its precedence exactly: a pre-order
 * walk (root, then each include subtree in order) with first-writer-wins. The BE
 * snapshot seeds the index at load, but this keeps it current with unsaved edits
 * so cross-file detection + jump-to-definition stay correct before save.
 */
function buildFromFiles(tree: TreeNode | undefined, files: Record<string, { ymlDocument: Document }>): EntityIndex {
  const index: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {} };

  TreeService.walk(tree, (node) => {
    const doc = files[node.nodeId]?.ymlDocument;
    if (!doc) {
      return;
    }

    KIND_SECTIONS.forEach(({ section, key }) => {
      const map = YmlUtils.getMapIn(doc, [section]);
      map?.items.forEach((pair) => {
        const entityId = String(pair.key);
        // First writer wins — don't overwrite a higher-precedence definition.
        if (entityId && !index[key][entityId]) {
          index[key][entityId] = { nodeId: node.nodeId };
        }
      });
    });
  });

  return index;
}

/** Shallow structural equality, so the store can skip no-op index updates. */
function equals(a: EntityIndex, b: EntityIndex): boolean {
  return KIND_SECTIONS.every(({ key }) => {
    const aEntries = a[key];
    const bEntries = b[key];
    const aIds = Object.keys(aEntries);
    return (
      aIds.length === Object.keys(bEntries).length && aIds.every((id) => aEntries[id].nodeId === bEntries[id]?.nodeId)
    );
  });
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
  buildFromFiles,
  equals,
};
