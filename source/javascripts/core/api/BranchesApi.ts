import { TreeNode } from '@/core/models/Tree';

import BitriseYmlApi from './BitriseYmlApi';
import Client, { ClientError } from './client';

type GetBranchesOptions = {
  appSlug: string;
  signal?: AbortSignal;
  limit?: number;
  q?: string;
};

export type GetBranchesResult = {
  branches: string[];
};

type PushBranchOptions = {
  appSlug: string;
  branch: string;
  sourceBranch: string;
  commitSha: string;
  message: string;
  /** Single-file (non-modular) config. */
  bitriseYml?: string;
  /** Modular config: full tree. The BE validates the whole merged config, then pushes the modified editable files. */
  root?: TreeNode;
};

export type PushBranchResult = {
  status: 'ok';
  commit_sha: string;
  pr_url?: string;
};

/** One module file that changed on the branch since load (modular push 409). */
export type PushBranchConflictFile = {
  nodeId: string;
  path: string;
  remoteYml: string;
};

/** Parsed body of a modular push 409 — the new branch HEAD plus every conflicting file. */
export type PushBranchConflict = {
  commitSha: string;
  conflicts: PushBranchConflictFile[];
};

type WirePushConflictFile = {
  node_id?: string;
  path?: string;
  remote_yml?: string;
};

/**
 * Extract the per-file conflict list from a 409 ClientError. Returns `undefined`
 * for a single-file (legacy) conflict, which carries `remote_yml`/`commit_sha`
 * but no `conflicts` array — the caller falls back to the legacy merge dialog.
 */
function parsePushConflict(error: unknown): PushBranchConflict | undefined {
  if (!(error instanceof ClientError) || error.status !== 409) {
    return undefined;
  }

  const data = error.data as { commit_sha?: string; conflicts?: WirePushConflictFile[] } | undefined;
  if (!data?.conflicts?.length) {
    return undefined;
  }

  return {
    commitSha: data.commit_sha ?? '',
    conflicts: data.conflicts.map((c) => ({
      nodeId: c.node_id ?? '',
      path: c.path ?? '',
      remoteYml: c.remote_yml ?? '',
    })),
  };
}

async function getBranches({ appSlug, signal, limit, q }: GetBranchesOptions): Promise<GetBranchesResult> {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  if (q) {
    params.append('q', q);
  }

  const path = `/app/${appSlug}/git-branches`;
  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;
  return Client.get<GetBranchesResult>(url, { signal });
}

async function pushBranch({ appSlug, branch, sourceBranch, commitSha, bitriseYml, root, message }: PushBranchOptions) {
  const payload = root
    ? { branch, source_branch: sourceBranch, commit_sha: commitSha, message, root: BitriseYmlApi.toWireTreeNode(root) }
    : { branch, source_branch: sourceBranch, commit_sha: commitSha, message, bitrise_yml: bitriseYml };

  return Client.post<PushBranchResult>(`/api/app/${appSlug}/config/push`, {
    body: JSON.stringify(payload),
  });
}

export default { getBranches, pushBranch, parsePushConflict };
