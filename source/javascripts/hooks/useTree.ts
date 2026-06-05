import { useStore } from 'zustand';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import { bitriseYmlStore, isFileDirty, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

// EntityKind → the active document's top-level section key.
const SECTION_BY_KIND: Record<EntityKind, 'workflows' | 'pipelines' | 'step_bundles'> = {
  workflows: 'workflows',
  pipelines: 'pipelines',
  stepBundles: 'step_bundles',
};

/**
 * The tree root (structural skeleton), by reference. Walk it via `TreeService`;
 * components don't traverse the tree themselves. Reference-stable: only changes
 * on load / post-save reload, so this uses plain referential equality rather
 * than a deep compare over the whole tree.
 */
export function useTree(): TreeNode | undefined {
  return useStore(bitriseYmlStore, (s) => s.tree);
}

export function useSelectedNodeId(): string | undefined {
  return useStore(bitriseYmlStore, (s) => s.selectedNodeId);
}

/**
 * True when the Merged-config tab is the active tab. On the merged view every
 * entity resolves locally, so "edit definition" / jump affordances should target
 * the entity's *source module* (via the entity index) rather than navigate
 * within the merged document.
 */
export function useIsMergedConfigSelected(): boolean {
  return useStore(bitriseYmlStore, (s) => s.selectedNodeId === MERGED_CONFIG_NODE_ID);
}

/**
 * The repo-relative path of the file that *defines* a cross-file entity, or
 * `undefined` when the entity isn't in the index (single-file mode, or defined
 * locally). Resolved purely from already-loaded metadata (entity index + the
 * per-node `path` on each file slice) — it never reads the other file's
 * contents, so it honours the "only show what's available from the open file"
 * rule. Used to render "Defined in <file>" provenance on cross-file references.
 */
export function useDefiningFilePath(kind: EntityKind, id: string): string | undefined {
  return useStore(bitriseYmlStore, (s) => {
    const nodeId = EntityIndexService.definingNodeId(s.entityIndex, kind, id);
    return nodeId ? s.files[nodeId]?.path : undefined;
  });
}

export type CrossFileEntityInfo = {
  /** The entity is referenced here but defined in another file. */
  isCrossFile: boolean;
  /** Repo-relative path of the (top-most) defining file. */
  definingPath?: string;
  /** Source ref of that file (e.g. `@feature-x`, `tag: v1.2`), if any. */
  sourceLabel?: string;
};

/**
 * Provenance for a candidate entity in the global selector pickers: whether it's
 * defined outside the active file, and — when it is — the top-most defining
 * file's path + source ref (branch/tag). All from already-loaded metadata (entity
 * index + the per-node `path`/`source` on each file slice); never reads the other
 * file's contents. `isCrossFile` is false in single-file mode (empty index) and
 * for entities defined in the active file. See `behavior.md` ("Entity pickers").
 */
export function useCrossFileEntity(kind: EntityKind, id: string): CrossFileEntityInfo {
  return useBitriseYmlStore((s) => {
    const isLocal = Boolean(s.yml[SECTION_BY_KIND[kind]]?.[id]);
    const nodeId = EntityIndexService.definingNodeId(s.entityIndex, kind, id);
    if (isLocal || !nodeId) {
      return { isCrossFile: false };
    }
    const file = s.files[nodeId];
    return {
      isCrossFile: true,
      definingPath: file?.path,
      sourceLabel: TreeService.sourceLabel(file?.source ?? null) ?? undefined,
    };
  });
}

/** node_ids of files with unsaved edits. */
export function useDirtyNodeIds(): string[] {
  return useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => isFileDirty(file))
      .map((file) => file.nodeId),
  );
}
