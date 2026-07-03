import { useStore } from 'zustand';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import { bitriseYmlStore, isFileDirty, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export const ROOT_META_STACK_FIELDS = ['stack', 'machine_type_id', 'stack_rollback_version'];

// Map-keyed kinds → their top-level YAML section (for the local-definition check). `appEnvs` is
// array-shaped (`app.envs`) and handled separately in useCrossFileEntity.
const SECTION_BY_KIND: Record<
  Exclude<EntityKind, 'appEnvs'>,
  'workflows' | 'pipelines' | 'step_bundles' | 'containers'
> = {
  workflows: 'workflows',
  pipelines: 'pipelines',
  stepBundles: 'step_bundles',
  containers: 'containers',
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
  /** Path of the top-most (highest-precedence) defining file. */
  definingPath?: string;
  /** Paths of every file that defines the entity, in precedence order. */
  definingPaths?: string[];
  sourceLabel?: string;
};

/** Provenance for an entity: whether it's defined locally, in another file, and where. */
export function useCrossFileEntity(kind: EntityKind, id: string): CrossFileEntityInfo {
  return useBitriseYmlStore((s) => {
    const isLocal =
      kind === 'appEnvs'
        ? Boolean(s.yml.app?.envs?.some((env) => env && id !== 'opts' && id in env))
        : Boolean(s.yml[SECTION_BY_KIND[kind]]?.[id]);
    const definitions = EntityIndexService.definitionsOf(s.entityIndex, kind, id);
    const nodeId = definitions[0]?.nodeId;
    const hasDefinition = Boolean(nodeId);
    if (isLocal || !nodeId) {
      return { isLocal, hasDefinition, isCrossFile: false };
    }
    const file = s.files[nodeId];
    const definingPaths = definitions
      .map((definition) => s.files[definition.nodeId]?.path)
      .filter((path): path is string => Boolean(path));
    return {
      isLocal,
      hasDefinition,
      isCrossFile: true,
      definingPath: file?.path,
      definingPaths,
      sourceLabel: TreeService.sourceLabel(file?.source ?? null) ?? undefined,
    };
  });
}

export type EntityDefinitionPath = { nodeId: string; path: string };

/**
 * Every file that defines the entity, in precedence order (top-most first), with paths resolved.
 * Unlike {@link useCrossFileEntity}, this doesn't short-circuit when the entity is also defined
 * locally — so it can surface the full "defined in module A, module B" set for a multi-module entity.
 * Empty in single-file mode (the entity index only tracks modular configs).
 */
export function useEntityDefinitionPaths(kind: EntityKind, id: string): EntityDefinitionPath[] {
  return useBitriseYmlStore((s) =>
    EntityIndexService.definitionsOf(s.entityIndex, kind, id)
      .map((definition) => ({ nodeId: definition.nodeId, path: s.files[definition.nodeId]?.path }))
      .filter((definition): definition is EntityDefinitionPath => Boolean(definition.path)),
  );
}

export type FileEntityGroup = { nodeId: string; path: string; ids: string[] };

/**
 * Group entity ids by the file that defines them (top-most layer), in tree pre-order — for the merged
 * view's per-file sections. Ids with no definition in the index are dropped. `ids` order is preserved
 * within each group.
 */
export function useEntitiesGroupedByFile(kind: EntityKind, ids: string[]): FileEntityGroup[] {
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return [];
    }
    const byNode = new Map<string, string[]>();
    ids.forEach((id) => {
      const nodeId = EntityIndexService.definingNodeId(s.entityIndex, kind, id);
      if (!nodeId) {
        return;
      }
      const bucket = byNode.get(nodeId);
      if (bucket) {
        bucket.push(id);
      } else {
        byNode.set(nodeId, [id]);
      }
    });

    const groups: FileEntityGroup[] = [];
    TreeService.walk(s.tree, (node) => {
      const groupIds = byNode.get(node.nodeId);
      if (groupIds?.length) {
        groups.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path, ids: groupIds });
      }
    });
    return groups;
  });
}

export type RootMetaDefinition = { nodeId: string; path: string };

/**
 * Files defining a root `meta['bitrise.io']` stack field (the default stack/machine), highest-precedence-first
 * — mirrors the entity-index walk (node before its includes, includes reversed). The default stack is a
 * singleton (not an id-keyed entity), so it isn't in the entity index; this resolves its source for the
 * Stacks "Default" tab's jump-to-definition.
 */
export function useRootMetaStackDefinitions(): RootMetaDefinition[] {
  // useBitriseYmlStore applies a deep-equal useShallow internally, so a fresh array is fine.
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return [];
    }
    const result: RootMetaDefinition[] = [];
    const seen = new Set<string>();
    const visit = (node?: TreeNode) => {
      if (!node || seen.has(node.nodeId)) {
        return;
      }
      seen.add(node.nodeId);
      const doc = s.files[node.nodeId]?.ymlDocument;
      const meta = doc ? YmlUtils.getMapIn(doc, ['meta', 'bitrise.io']) : undefined;
      if (meta && ROOT_META_STACK_FIELDS.some((field) => meta.has(field))) {
        result.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path });
      }
      for (let i = node.includes.length - 1; i >= 0; i -= 1) {
        visit(node.includes[i]);
      }
    };
    visit(s.tree);
    return result;
  });
}

export type InheritedDefaultStack = {
  /** Path of the top-most file defining the default (for the "Defined in …" subtitle). */
  definingPath: string;
  /** All files defining a default, highest-precedence-first (for the jump-to-definition picker). */
  nodeIds: string[];
  value: { stackId: string; machineTypeId: string; stackRollbackVersion: string };
};

/**
 * The effective default stack & machine inherited by a module that doesn't define its own — sourced
 * from the top-most (winning) `meta['bitrise.io']` definition, so a module tab can show it read-only.
 * Undefined outside modular mode or when no file defines a default.
 */
export function useInheritedDefaultStack(): InheritedDefaultStack | undefined {
  const definitions = useRootMetaStackDefinitions();
  return useBitriseYmlStore((s) => {
    const top = definitions[0];
    const doc = top ? s.files[top.nodeId]?.ymlDocument : undefined;
    const meta = doc ? YmlUtils.getMapIn(doc, ['meta', 'bitrise.io']) : undefined;
    if (!top || !meta) {
      return undefined;
    }
    return {
      definingPath: top.path,
      nodeIds: definitions.map((definition) => definition.nodeId),
      value: {
        stackId: String(meta.get('stack') ?? ''),
        machineTypeId: String(meta.get('machine_type_id') ?? ''),
        stackRollbackVersion: String(meta.get('stack_rollback_version') ?? ''),
      },
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
