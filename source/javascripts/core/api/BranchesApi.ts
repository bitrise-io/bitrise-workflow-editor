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

async function getBranches({ appSlug, signal, limit, q }: GetBranchesOptions): Promise<GetBranchesResult> {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  if (q) {
    params.append('q', q);
  }

  const path = `/api/app/${appSlug}/git-branches`;
  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;
  return Client.get<GetBranchesResult>(url, { signal });
}

export default { getBranches };
