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
  bitriseYml: string;
  message: string;
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

async function pushBranch({ appSlug, branch, sourceBranch, commitSha, bitriseYml, message }: PushBranchOptions) {
  return Client.post(`/api/app/${appSlug}/config/push`, {
    body: JSON.stringify({
      branch,
      source_branch: sourceBranch,
      commit_sha: commitSha,
      bitrise_yml: bitriseYml,
      message,
    }),
  });
}

export default { getBranches, pushBranch };
