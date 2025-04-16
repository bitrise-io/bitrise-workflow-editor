import { delay, http, HttpResponse } from 'msw';

import { LicensePoolKind } from '../models/LicensePool';
import LicensePoolsApi, { LicencePoolsResponse } from './LicensePoolsApi';

function getWorkspaceLicensePools(isEmpty?: boolean) {
  return http.get(LicensePoolsApi.getWorkspaceLicensesPoolsPath(':workspaceSlug'), async (): Promise<Response> => {
    await delay();

    if (isEmpty) {
      return HttpResponse.json<LicencePoolsResponse>([]);
    }

    return HttpResponse.json<LicencePoolsResponse>([
      {
        id: 'pool-1',
        name: 'pool 1',
        env_var_name: 'pool_1_env',
        description: 'dede',
        kind: LicensePoolKind.UNITY,
        created_at: '2023-08-29T14:48:17.367908Z',
        modified_at: '2023-08-29T14:48:17.367908Z',
        licenses: [
          {
            id: 'license-1',
            value: 'h',
          },
        ],
      },
      {
        id: 'pool-2',
        name: 'pool 2',
        env_var_name: 'pool_2_env',
        description: 'dede',
        kind: LicensePoolKind.UNITY,
        created_at: '2023-08-29T14:48:17.367908Z',
        modified_at: '2023-08-29T14:48:17.367908Z',
        licenses: [
          {
            id: 'license-2',
            value: 'h',
          },
        ],
      },
    ]);
  });
}

export default {
  getWorkspaceLicensePools,
};
