import { Document } from 'yaml';

import { EntityDefinition, EntityIndex, EntityKind, TreeNode } from '@/core/models/Tree';
import YmlUtils from '@/core/utils/YmlUtils';

import TreeService from './TreeService';

// YAML section key → EntityIndex key. step_bundles is camelCased in the index.
const KIND_SECTIONS: ReadonlyArray<{ section: string; key: EntityKind }> = [
  { section: 'workflows', key: 'workflows' },
  { section: 'pipelines', key: 'pipelines' },
  { section: 'step_bundles', key: 'stepBundles' },
];

function emptyEntityIndex(): EntityIndex {
  return { workflows: {}, pipelines: {}, stepBundles: {} };
}

/** All places this entity is defined, in merge order (`[0]` = top-most). */
function definitionsOf(index: EntityIndex, kind: EntityKind, id: string): EntityDefinition[] {
  return index[kind]?.[id] ?? [];
}

/** The `nodeId` of the top-most (highest-precedence) node defining this entity; use `definitionsOf` when every layer matters. */
function definingNodeId(index: EntityIndex, kind: EntityKind, id: string): string | undefined {
  return definitionsOf(index, kind, id)[0]?.nodeId;
}

/** Build the entity index live from open file documents (mirrors the BE builder) so cross-file detection stays correct before save. */
function buildFromFiles(tree: TreeNode | undefined, files: Record<string, { ymlDocument: Document }>): EntityIndex {
  const index = emptyEntityIndex();

  TreeService.walk(tree, (node) => {
    const doc = files[node.nodeId]?.ymlDocument;
    if (!doc) {
      return;
    }

    KIND_SECTIONS.forEach(({ section, key }) => {
      const map = YmlUtils.getMapIn(doc, [section]);
      map?.items.forEach((pair) => {
        const entityId = String(pair.key);
        if (!entityId) {
          return;
        }
        // Pre-order append: first is top-most layer, later ones are lower layers.
        (index[key][entityId] ||= []).push({ nodeId: node.nodeId });
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
    if (aIds.length !== Object.keys(bEntries).length) {
      return false;
    }
    return aIds.every((id) => {
      const aDefs = aEntries[id];
      const bDefs = bEntries[id];
      return (
        bDefs !== undefined && aDefs.length === bDefs.length && aDefs.every((def, i) => def.nodeId === bDefs[i]?.nodeId)
      );
    });
  });
}

export default {
  emptyEntityIndex,
  definingNodeId,
  definitionsOf,
  buildFromFiles,
  equals,
};
