import { useStore } from 'zustand';

import { EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import { bitriseYmlStore, isFileDirty, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';
import { buildNodeUris } from '@/core/utils/lspModelUris';
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

/**
 * The bitrise:// model URI for a tree node — the shared identity between the editor and the language
 * service. `undefined` for the merged tab or an unknown node (both are outside the LS workspace).
 */
export function useNodeModelUri(nodeId: string | undefined): string | undefined {
  return useBitriseYmlStore((s) => {
    if (!s.tree || !nodeId || nodeId === MERGED_CONFIG_NODE_ID) return undefined;
    return buildNodeUris(s.tree).get(nodeId);
  });
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

export type OtherDefiningModules = {
  /** Repo-relative paths of the defining files other than the one currently open, precedence order. */
  paths: string[];
  /** node_ids of those files (for the jump-to-definition picker). */
  nodeIds: string[];
  /** Cross-repo source label, only when exactly one other module defines it and it lives in another repo/ref. */
  sourceLabel?: string;
  /** The entity is also defined in the module currently open (⇒ "Also defined in" vs. plain "Defined in"). */
  definedInCurrent: boolean;
};

const NO_OTHER_MODULES: OtherDefiningModules = { paths: [], nodeIds: [], definedInCurrent: false };

/**
 * The modules that define an entity *other than the one currently open* — the data behind the
 * "Also defined in …" provenance line. Excludes the active module (so it surfaces only where the
 * entity is *also* defined) and reports whether the active module is among the definers, which
 * chooses the "Also defined in" vs. plain "Defined in" wording (the latter e.g. on the merged view,
 * where there is no single current module). Empty in single-file mode. — BIVS-3706
 */
export function useOtherDefiningModules(kind: EntityKind, id: string): OtherDefiningModules {
  return useBitriseYmlStore((s) => {
    const definitions = EntityIndexService.definitionsOf(s.entityIndex, kind, id)
      .map((definition) => ({ nodeId: definition.nodeId, file: s.files[definition.nodeId] }))
      .filter((definition) => Boolean(definition.file?.path));
    const others = definitions.filter((definition) => definition.nodeId !== s.selectedNodeId);
    if (others.length === 0) {
      return NO_OTHER_MODULES;
    }
    return {
      paths: others.map((other) => other.file?.path ?? ''),
      nodeIds: others.map((other) => other.nodeId),
      sourceLabel:
        others.length === 1 ? (TreeService.sourceLabel(others[0].file?.source ?? null) ?? undefined) : undefined,
      definedInCurrent: others.length < definitions.length,
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

export type DefaultStackValue = { stackId: string; machineTypeId: string; stackRollbackVersion: string };

export type DefaultStackDefinition = {
  nodeId: string;
  path: string;
  value: DefaultStackValue;
};

/**
 * Each file that defines a root `meta['bitrise.io']` default stack/machine, highest-precedence-first
 * (node before its includes, includes reversed — mirroring the entity-index walk), with its own
 * values. The default stack is a singleton (not an id-keyed entity), so it isn't in the entity index;
 * this resolves its per-file sources for the Stacks "Default" tab (jump-to-definition + the merged
 * per-module breakdown). Empty outside modular mode or when no file defines a default.
 */
export function useDefaultStackDefinitions(): DefaultStackDefinition[] {
  // A single pure selector over `state` (nothing closed over from another hook), so store updates
  // recompute it consistently. useBitriseYmlStore applies a deep-equal useShallow, so a fresh array is fine.
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return [];
    }
    const result: DefaultStackDefinition[] = [];
    const seen = new Set<string>();
    const visit = (node?: TreeNode) => {
      if (!node || seen.has(node.nodeId)) {
        return;
      }
      seen.add(node.nodeId);
      const doc = s.files[node.nodeId]?.ymlDocument;
      const meta = doc ? YmlUtils.getMapIn(doc, ['meta', 'bitrise.io']) : undefined;
      if (meta && ROOT_META_STACK_FIELDS.some((field) => meta.has(field))) {
        result.push({
          nodeId: node.nodeId,
          path: s.files[node.nodeId]?.path ?? node.path,
          value: {
            stackId: String(meta.get('stack') ?? ''),
            machineTypeId: String(meta.get('machine_type_id') ?? ''),
            stackRollbackVersion: String(meta.get('stack_rollback_version') ?? ''),
          },
        });
      }
      for (let i = node.includes.length - 1; i >= 0; i -= 1) {
        visit(node.includes[i]);
      }
    };
    visit(s.tree);
    return result;
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
