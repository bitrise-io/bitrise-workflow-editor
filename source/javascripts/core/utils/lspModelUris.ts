import { composeBitriseUri, type GitRef } from '@bitrise/languageserver-core';

import { TreeNode, TreeNodeSource } from '@/core/models/Tree';
import TreeService from '@/core/services/TreeService';

/**
 * Model URI for a single (non-modular) config: the working repo's root file. `bitrise.yml` is the
 * conventional name — a non-modular config has no `include:` edges to match, so the exact basename
 * is cosmetic.
 */
export const ROOT_MODEL_URI = composeBitriseUri({ repo: '.', path: 'bitrise.yml' });

/**
 * The read-only merged-config preview runs as its OWN isolated language-service workspace, on a
 * distinct scheme from the `bitrise://` tree. That gives it in-file go-to-definition / references /
 * hover while keeping its flattened union of symbols out of the real cross-file workspace (a
 * `bitrise://` merged model would duplicate every symbol as a phantom deep-merge layer). Paired with
 * a second `configureBitriseYaml({ scheme })` instance — see MonacoUtils.
 */
export const MERGED_MODEL_SCHEME = 'bitrise-merged';
export const MERGED_MODEL_URI = `${MERGED_MODEL_SCHEME}://./merged_config.yml`;

/** Fold an include entry's branch/tag/commit into the codec's structured ref (commit > tag > branch). */
function refFromSource(source: TreeNodeSource): GitRef | undefined {
  if (source.commit) return { type: 'commit', value: source.commit };
  if (source.tag) return { type: 'tag', value: source.tag };
  if (source.branch) return { type: 'branch', value: source.branch };
  return undefined;
}

// Keyed by tree identity: the store swaps `tree` only when the structure changes (a keystroke
// clones `files`, never `tree` — see commitActiveFileDocument), so callers on the hot path
// (useNodeModelUri runs per store update) reuse the same map instead of re-walking every time.
// WeakMap ⇒ no invalidation; the entry is collected with its tree.
const uriMapByTree = new WeakMap<TreeNode, Map<string, string>>();

/**
 * The `bitrise://` model URI for every tree node, keyed by `nodeId`. Each string is byte-identical to
 * what core composes when resolving `include:` edges, so symbols and include links resolve across
 * files by exact-string match (see `composeBitriseUri`). Identity follows the same rules as the codec:
 *
 *  - root → the working repo (`.`)
 *  - local include (no `repository`) → inherits its includer's repo + ref
 *  - cross-repo include → its own `repository` + ref (branch/tag/commit)
 */
export function buildNodeUris(root: TreeNode): Map<string, string> {
  const cached = uriMapByTree.get(root);
  if (cached) return cached;

  const identityByNode = new Map<string, { repo: string; ref?: GitRef }>();
  const uriByNode = new Map<string, string>();

  // Pre-order, so a node's includer identity is always resolved before the node itself.
  TreeService.walk(root, (node, parent) => {
    const { source } = node;
    let identity: { repo: string; ref?: GitRef };
    if (!parent) {
      identity = { repo: '.' };
    } else if (source?.repository) {
      identity = { repo: source.repository, ref: refFromSource(source) };
    } else {
      identity = identityByNode.get(parent.nodeId) ?? { repo: '.' };
    }

    identityByNode.set(node.nodeId, identity);
    uriByNode.set(node.nodeId, composeBitriseUri({ ...identity, path: node.path }));
  });

  uriMapByTree.set(root, uriByNode);
  return uriByNode;
}
