import { TreeNode } from '@/core/models/Tree';

import BitriseYmlApi from './BitriseYmlApi';
import Client from './client';

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

export default { getBranches, pushBranch };
