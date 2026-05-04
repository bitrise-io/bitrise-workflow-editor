import { delay, http, HttpResponse } from 'msw';

export function pushBranch(error?: string) {
  return http.post('/api/app/:appSlug/config/push', async (): Promise<Response> => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    return new HttpResponse(null, { status: 200 });
  });
}
