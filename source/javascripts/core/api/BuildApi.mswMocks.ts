import { delay, http, HttpResponse } from 'msw';

import BuildApi, { StartBuildErrorResponse, StartBuildResponse } from './BuildApi';

function startBuild(status: 'success' | 'error' = 'success') {
  return http.post(BuildApi.getStartBuildPath(':appSlug'), async (): Promise<Response> => {
    await delay();

    if (status === 'error') {
      return HttpResponse.json<StartBuildErrorResponse>(
        {
          status: 'error',
          message: 'Workflow (asd) did not match any workflows defined in app config',
          triggered_workflow: 'asd',
          results: [
            {
              status: 'error',
              message: 'Workflow (asd) did not match any workflows defined in app config',
              triggered_workflow: 'asd',
            },
          ],
        },
        { status: 400, statusText: 'Something went wrong' },
      );
    }

    return HttpResponse.json<StartBuildResponse>({
      status: 'ok',
      build_url: 'http://example.com',
    } satisfies StartBuildResponse);
  });
}

export default {
  startBuild,
};
