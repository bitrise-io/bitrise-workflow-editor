import { useQuery } from '@tanstack/react-query';

import { ClientError } from '@/core/api/client';
import LicensePoolsApi from '@/core/api/LicensePoolsApi';
import { LicensePool } from '@/core/models/LicensePool';

type GetQueryProps = { workspaceSlug: string };

const useGetLicensePoolsQuery = (props: GetQueryProps) => {
  const { workspaceSlug } = props;

  return useQuery<Array<LicensePool>, ClientError>({
    queryKey: [LicensePoolsApi.getWorkspaceLicensesPoolsPath(workspaceSlug)],
    queryFn: ({ signal }) => LicensePoolsApi.getWorkspaceLicensePools({ workspaceSlug, signal }),
    staleTime: Infinity,
  });
};

export { useGetLicensePoolsQuery };
