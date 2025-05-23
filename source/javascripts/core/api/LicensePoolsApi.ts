import { pick } from 'es-toolkit';

import { LicensePool, LicensePoolKind } from '../models/LicensePool';
import Client from './client';

// DTOs
export type LicencePoolsResponse = Array<{
  created_at: string;
  description?: string;
  env_var_name: string;
  id: string;
  kind: LicensePoolKind;
  name: string;
  modified_at: string;
  licenses: Array<{
    id: string;
    value: string;
  }>;
}>;

// TRANSFORMATIONS
function toLicensePools(response: LicencePoolsResponse): Array<LicensePool> {
  return response.map((pool) => ({
    ...pick(pool, ['description', 'id', 'kind', 'name', 'licenses']),
    createdAt: pool.created_at,
    envVarName: pool.env_var_name,
    modifiedAt: pool.modified_at,
  }));
}

function getWorkspaceLicensesPoolsPath(workspaceSlug: string): string {
  return `/organizations/${workspaceSlug}/license_pools`;
}

async function getWorkspaceLicensePools({
  workspaceSlug,
  signal,
}: {
  workspaceSlug: string;
  signal?: AbortSignal;
}): Promise<Array<LicensePool>> {
  const response = await Client.get<LicencePoolsResponse>(getWorkspaceLicensesPoolsPath(workspaceSlug), {
    signal,
  });
  return toLicensePools(response);
}

export default {
  getWorkspaceLicensesPoolsPath,
  getWorkspaceLicensePools,
};
