import { delay, http, HttpResponse } from 'msw';
import BuildApi, { StartBuildResponse } from './BuildApi';

function startBuild(status: 'success' | 'error' = 'success') {
  return http.post(BuildApi.getStartBuildPath(':appSlug'), async () => {
    await delay();

    if (status === 'error') {
      return HttpResponse.error();
    }

    return HttpResponse.json({
      status: 'ok',
      build_url: 'http://example.com',
    } satisfies StartBuildResponse);
  });
}

export default {
  startBuild,
};
