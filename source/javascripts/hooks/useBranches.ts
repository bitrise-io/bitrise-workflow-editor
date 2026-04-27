import { useQuery } from '@tanstack/react-query';

import BranchesApi from '@/core/api/BranchesApi';
import PageProps from '@/core/utils/PageProps';

type UseBranchesProps = {
  q?: string;
  limit?: number;
  enabled?: boolean;
};

export function useBranches({ q, limit, enabled = true }: UseBranchesProps = {}) {
  const appSlug = PageProps.appSlug();

  return useQuery({
    queryKey: [`/api/app/${appSlug}/git-branches`, { q, limit }],
    queryFn: ({ signal }) => BranchesApi.getBranches({ appSlug, signal, q, limit }),
    enabled,
  });
}
