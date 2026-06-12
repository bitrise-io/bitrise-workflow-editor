import { useStore } from 'zustand';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import { bitriseYmlStore, isFileDirty, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const SECTION_BY_KIND: Record<EntityKind, 'workflows' | 'pipelines' | 'step_bundles'> = {
  workflows: 'workflows',
  pipelines: 'pipelines',
  stepBundles: 'step_bundles',
};

/** The tree root, by reference. Walk it via `TreeService`. */
export function useTree(): TreeNode | undefined {
  return useStore(bitriseYmlStore, (s) => s.tree);
}

export function useSelectedNodeId(): string | undefined {
  return useStore(bitriseYmlStore, (s) => s.selectedNodeId);
}

/** True when the Merged-config tab is the active tab. */
export function useIsMergedConfigSelected(): boolean {
  return useStore(bitriseYmlStore, (s) => s.selectedNodeId === MERGED_CONFIG_NODE_ID);
}

/** Repo-relative path of the file that defines a cross-file entity, or `undefined` if not in the index. */
export function useDefiningFilePath(kind: EntityKind, id: string): string | undefined {
  return useStore(bitriseYmlStore, (s) => {
    const nodeId = EntityIndexService.definingNodeId(s.entityIndex, kind, id);
    return nodeId ? s.files[nodeId]?.path : undefined;
  });
}

export type ReadOnlyViewInfo = {
  /** True when the active view can't be edited: the merged config preview, or a cross-repo/ref file. */
  isReadOnly: boolean;
  isMergedConfig: boolean;
  /** Effective source ref of the read-only file (e.g. `repo@branch`), when that's the reason. */
  sourceLabel?: string;
};

const EDITABLE_VIEW: ReadOnlyViewInfo = { isReadOnly: false, isMergedConfig: false };

/** Whether the active view is read-only ("ghost"), and why: merged preview or cross-repo/ref file. */
export function useReadOnlyView(): ReadOnlyViewInfo {
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return EDITABLE_VIEW;
    }
    if (s.selectedNodeId === MERGED_CONFIG_NODE_ID) {
      return { isReadOnly: true, isMergedConfig: true };
    }
    const file = s.selectedNodeId ? s.files[s.selectedNodeId] : undefined;
    if (file && !file.editable) {
      return {
        isReadOnly: true,
        isMergedConfig: false,
        sourceLabel: TreeService.effectiveSourceLabel(s.tree, file.nodeId) ?? undefined,
      };
    }
    return EDITABLE_VIEW;
  });
}

/** Boolean shorthand for `useReadOnlyView` — true on the merged config tab and on cross-repo/ref files. */
export function useIsReadOnlyView(): boolean {
  return useReadOnlyView().isReadOnly;
}

export type CrossFileEntityInfo = {
  isLocal: boolean;
  /** Defined in some file (local or cross-file) — i.e. present in the entity index. */
  hasDefinition: boolean;
  isCrossFile: boolean;
  definingPath?: string;
  sourceLabel?: string;
};

/** Provenance for an entity: whether it's defined locally, in another file, and where. */
export function useCrossFileEntity(kind: EntityKind, id: string): CrossFileEntityInfo {
  return useBitriseYmlStore((s) => {
    const isLocal = Boolean(s.yml[SECTION_BY_KIND[kind]]?.[id]);
    const nodeId = EntityIndexService.definingNodeId(s.entityIndex, kind, id);
    const hasDefinition = Boolean(nodeId);
    if (isLocal || !nodeId) {
      return { isLocal, hasDefinition, isCrossFile: false };
    }
    const file = s.files[nodeId];
    return {
      isLocal,
      hasDefinition,
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
