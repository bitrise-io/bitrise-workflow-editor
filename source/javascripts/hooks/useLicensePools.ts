import { useQuery } from '@tanstack/react-query';
import LicensePoolsApi from '@/core/api/LicensePoolsApi';
import { ClientError } from '@/core/api/client';
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
