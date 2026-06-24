import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

/** The effective `(repository, ref)` a node resolves to after include inheritance. */
type EffectiveRef = {
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

export type FileTreeFile = {
  nodeId: string;
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
  key: string;
  /** Header text: `gitRepoSlug` for the working repo, else `<repo>@<ref>`. */
  header: string;
  isReadOnly: boolean;
  root: FileTreeFolder;
};

type BuildOptions = {
  /** Label for the working-repo group header (the project's `gitRepoSlug`). */
  projectRepoLabel: string;
  filter?: (node: TreeNode) => boolean;
};

/** Short ref label for group headers, e.g. `@branch-a`, `:v1.4.0`, `:9d1df`. */
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

/** Resolve a node's effective `(repository, ref)`, mirroring how the backend inherits refs down the include chain. */
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

function isWorkingRepoRef(ref: EffectiveRef): boolean {
  return ref.repository === null && !ref.branch && !ref.tag && !ref.commit;
}

type GroupAccumulator = {
  key: string;
  ref: EffectiveRef;
  files: TreeNode[];
};

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

/** Collapse single-child directory chains so `a → b → c` renders as one `a/b/c` entry. */
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

// Case-insensitive, numeric compare so ordering is deterministic (include order isn't stable) and `file2` sorts before `file10`.
const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

// Files first, then folders, each by name; files tie-break on nodeId for stability.
function sortFolder(folder: FileTreeFolder): FileTreeFolder {
  return {
    ...folder,
    files: [...folder.files].sort((a, b) => byName(a.fileName, b.fileName) || byName(a.nodeId, b.nodeId)),
    folders: folder.folders.map(sortFolder).sort((a, b) => byName(a.label, b.label)),
  };
}

/** Build the grouped file/folder model: bucket files by effective ref (working repo first), each group a collapsed, sorted folder tree. */
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

  // Working repo first; other groups follow, sorted by header for stability.
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
      root: sortFolder({ ...rootFolder, folders: rootFolder.folders.map(collapse) }),
    };
  });
}

export type FileDescriptor = {
  fileName: string;
  /**
   * The file-tree group header for any read-only group — a cross-repo include, or the same repo
   * pinned to a different ref. Formatted like the headers `buildFileTree` produces: `<repo>@<branch>`,
   * `<repo>:<tag>`, `<repo>:<short-commit>`, or just `<repo>` when there's no ref marker. `null` for
   * working-repo files.
   */
  repoLabel: string | null;
};

/**
 * Builds a flat `nodeId → { fileName, repoLabel }` lookup over the whole tree (one entry per
 * reachable file), for list/menu views (e.g. the jump-to-definition menu) that need a file's name
 * and cross-repo origin without the folder tree. Callers index into it with their own `nodeId`
 * subset. Reuses {@link buildFileTree} so ref inheritance and grouping stay defined in one place.
 */
function describeFiles(root: TreeNode | undefined, projectRepoLabel: string): Map<string, FileDescriptor> {
  const map = new Map<string, FileDescriptor>();
  buildFileTree(root, { projectRepoLabel }).forEach((group) => {
    const repoLabel = group.isReadOnly ? group.header : null;
    const walk = (folder: FileTreeFolder) => {
      folder.files.forEach((file) => map.set(file.nodeId, { fileName: file.fileName, repoLabel }));
      folder.folders.forEach(walk);
    };
    walk(group.root);
  });
  return map;
}

export default {
  buildFileTree,
  describeFiles,
};
