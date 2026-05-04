import { delay, http, HttpResponse } from 'msw';

import { GetBranchesResult } from '@/core/api/BranchesApi';

export function getBranches() {
  return http.get('/api/app/:appSlug/git-branches', async (): Promise<Response> => {
    await delay();

    return HttpResponse.json<GetBranchesResult>({
      branches: [
        'spongebob-squarepants',
        'patrick-star',
        'squidward-tentacles',
        'sandy-cheeks',
        'mr-krabs',
        'gary-the-snail',
        'larry-the-lobster',
      ],
    });
  });
}

export function getCiConfig(error?: string) {
  return http.get('/api/app/:appSlug/config.yml', async () => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return HttpResponse.text('format_version: "13"', { status: 200 });
  });
}
