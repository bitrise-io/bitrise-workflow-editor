import { delay, http, HttpResponse } from 'msw';

import EnvVarsApi, { DefaultOutputsResponse } from './EnvVarsApi';

export const getDefaultOutputs = (appSlug?: string) => {
  return http.get(EnvVarsApi.getDefaultOutputsPath(appSlug), async () => {
    await delay();

    return HttpResponse.json({
      from_bitrise_cli: [{ DEFAULT_OUTPUT_FROM_CLI: null }],
      from_bitriseio: appSlug ? [{ DEFAULT_OUTPUT_FROM_BITRISEIO: null }] : undefined,
    } satisfies DefaultOutputsResponse);
  });
};
