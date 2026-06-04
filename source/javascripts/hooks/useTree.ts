import { useStore } from 'zustand';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import { bitriseYmlStore, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

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

/** node_ids of files with unsaved edits. */
export function useDirtyNodeIds(): string[] {
  return useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => !YmlUtils.isEquals(file.ymlDocument, file.savedYmlDocument))
      .map((file) => file.nodeId),
  );
}
