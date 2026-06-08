import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

/**
 * Render model for the "Open module" file selector (and the diff / jump-to-def
 * reuses). This is a **file/folder/path** view, NOT the include hierarchy: files
 * are grouped by the source they effectively come from — a distinct
 * `(repository, branch/tag/commit)` is its own group — and within a group laid
 * out by their on-disk path (collapsing single-child directory chains). The
 * working repo at the root's ref is the first group and the only editable one;
 * every other ref/repo group is read-only. File names carry no ref marker — the
 * group header names the ref instead.
 *
 * Pure + framework-free so it can be unit-tested in isolation; `FileTreeView`
 * turns the output into `BitkitTreeView` collections.
 */

/** The effective `(repository, ref)` a node resolves to after include inheritance. */
type EffectiveRef = {
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

export type FileTreeFile = {
  /** `node_id` — selection identity. */
  nodeId: string;
  /** Basename of the path. */
  fileName: string;
  editable: boolean;
  node: TreeNode;
};

export type FileTreeFolder = {
  /** Stable id within a group's collection (the joined directory path). */
  id: string;
  /** Possibly-collapsed directory label, e.g. `e2e/bitrise/testing`. */
  label: string;
  folders: FileTreeFolder[];
  files: FileTreeFile[];
};

export type FileTreeGroup = {
  /** Stable group id (the full ref identity). */
  key: string;
  /** Header text: `gitRepoSlug` for the working repo, else `<repo>@<ref>`. */
  header: string;
  /** Every group other than the working repo's root ref is read-only. */
  isReadOnly: boolean;
  /** Top-level directory holding the group's root files + folders. */
  root: FileTreeFolder;
};

type BuildOptions = {
  /** Label for the working-repo group header (the project's `gitRepoSlug`). */
  projectRepoLabel: string;
  /** When set, only files for which this returns `true` are included. */
  filter?: (node: TreeNode) => boolean;
};

/** Short ref label, e.g. `@branch-a`, `:v1.4.0`, `:9d1df` — used in group headers. */
function refMarker(ref: EffectiveRef): string | null {
  if (ref.commit) {
    return `:${ref.commit.slice(0, 7)}`;
  }
  if (ref.tag) {
    return `:${ref.tag}`;
  }
  if (ref.branch) {
    return `@${ref.branch}`;
  }
  return null;
}

/**
 * Resolve a node's effective `(repository, ref)` given its parent's effective
 * value, mirroring how the backend inherits refs down the include chain:
 * - the root carries no source → the working repo at its current branch;
 * - a `source` that names a `repository` uses its own ref (cross-repo, or an
 *   explicit same-repo include);
 * - a `source` that names a branch/tag/commit but no repository stays in the
 *   parent's repo but overrides the ref (e.g. a same-repo include from another
 *   branch);
 * - a pure path-only `source` inherits the parent's repo *and* ref.
 */
function resolveEffectiveRef(source: TreeNodeSource | null, parent: EffectiveRef): EffectiveRef {
  if (!source) {
    return { repository: null, branch: null, tag: null, commit: null };
  }
  if (source.repository) {
    return {
      repository: source.repository,
      branch: source.branch,
      tag: source.tag,
      commit: source.commit,
    };
  }
  if (source.branch || source.tag || source.commit) {
    return {
      repository: parent.repository,
      branch: source.branch,
      tag: source.tag,
      commit: source.commit,
    };
  }
  return parent;
}

/** Identity key for grouping by the full effective ref (repo + branch/tag/commit). */
function refKey(ref: EffectiveRef): string {
  return `${ref.repository ?? '__project__'}|${ref.branch ?? ''}|${ref.tag ?? ''}|${ref.commit ?? ''}`;
}

/** The working repo at the root's ref — the one editable group, headed by name only. */
function isWorkingRepoRef(ref: EffectiveRef): boolean {
  return ref.repository === null && !ref.branch && !ref.tag && !ref.commit;
}

type GroupAccumulator = {
  key: string;
  ref: EffectiveRef;
  files: TreeNode[];
};

/** Insert a file into a group's nested folder structure by its path segments. */
function insertFile(rootFolder: FileTreeFolder, file: FileTreeFile, dirSegments: string[]): void {
  let cursor = rootFolder;
  dirSegments.forEach((segment) => {
    const id = cursor.id ? `${cursor.id}/${segment}` : segment;
    let next = cursor.folders.find((folder) => folder.id === id);
    if (!next) {
      next = { id, label: segment, folders: [], files: [] };
      cursor.folders.push(next);
    }
    cursor = next;
  });
  cursor.files.push(file);
}

/**
 * Collapse single-child directory chains: a folder with exactly one child that
 * is itself a folder (and no files of its own) is merged with that child, so
 * `a → b → c` (only branching at `c`) renders as one `a/b/c` entry.
 */
function collapse(folder: FileTreeFolder): FileTreeFolder {
  let current = folder;
  while (current.files.length === 0 && current.folders.length === 1) {
    const [only] = current.folders;
    current = {
      id: only.id,
      label: `${current.label}/${only.label}`,
      folders: only.folders,
      files: only.files,
    };
  }
  return {
    ...current,
    folders: current.folders.map(collapse),
  };
}

// Natural, case-insensitive name compare so ordering is deterministic across
// loads (the tree's include order is not stable). `numeric` so `file2` sorts
// before `file10`.
const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

/**
 * Deterministically sort a folder's contents (recursively). Files first, then
 * folders — each group sorted by name. Files tie-break on `nodeId` so any two
 * same-named files keep a stable order.
 */
function sortFolder(folder: FileTreeFolder): FileTreeFolder {
  return {
    ...folder,
    files: [...folder.files].sort((a, b) => byName(a.fileName, b.fileName) || byName(a.nodeId, b.nodeId)),
    folders: folder.folders.map(sortFolder).sort((a, b) => byName(a.label, b.label)),
  };
}

/**
 * Build the grouped file/folder model. Walks the include tree (pre-order,
 * cycle-guarded) resolving each node's effective repo + ref, buckets files by
 * the full ref identity (working repo first, the rest sorted by header), then
 * lays each group out as a collapsed folder tree with deterministically sorted
 * contents.
 */
function buildFileTree(root: TreeNode | undefined, options: BuildOptions): FileTreeGroup[] {
  if (!root) {
    return [];
  }

  const groups = new Map<string, GroupAccumulator>();
  const seen = new Set<string>();

  const visit = (node: TreeNode, parentRef: EffectiveRef) => {
    if (seen.has(node.nodeId)) {
      return;
    }
    seen.add(node.nodeId);

    const ref = resolveEffectiveRef(node.source, parentRef);
    const key = refKey(ref);

    let group = groups.get(key);
    if (!group) {
      group = { key, ref, files: [] };
      groups.set(key, group);
    }
    if (!options.filter || options.filter(node)) {
      group.files.push(node);
    }

    node.includes.forEach((child) => visit(child, ref));
  };

  visit(root, { repository: null, branch: null, tag: null, commit: null });

  const descriptors = [...groups.values()]
    .filter((group) => group.files.length > 0)
    .map((group) => {
      const isWorking = isWorkingRepoRef(group.ref);
      const repoName = group.ref.repository ?? options.projectRepoLabel;
      const header = isWorking ? options.projectRepoLabel : `${repoName}${refMarker(group.ref) ?? ''}`;
      return { group, isWorking, header };
    });

  // The working repo always renders first; every other ref/repo group follows,
  // sorted by header so the order is stable across loads.
  descriptors.sort((a, b) => {
    if (a.isWorking !== b.isWorking) {
      return a.isWorking ? -1 : 1;
    }
    return byName(a.header, b.header);
  });

  return descriptors.map(({ group, isWorking, header }) => {
    const rootFolder: FileTreeFolder = { id: '', label: '', folders: [], files: [] };
    group.files.forEach((node) => {
      const segments = node.path.split('/').filter(Boolean);
      const dirSegments = segments.slice(0, -1);
      const fileName = segments[segments.length - 1] ?? node.path;
      insertFile(rootFolder, { nodeId: node.nodeId, fileName, editable: node.editable, node }, dirSegments);
    });

    return {
      key: group.key,
      header,
      isReadOnly: !isWorking,
      // Collapse single-child chains, then sort deterministically (keeping the
      // empty-label group root itself).
      root: sortFolder({ ...rootFolder, folders: rootFolder.folders.map(collapse) }),
    };
  });
}

export default {
  buildFileTree,
};
