import { delay, http, HttpResponse } from 'msw';

export function pushBranch(error?: string, prUrl?: string) {
  return http.post('/api/app/:appSlug/config/push', async (): Promise<Response> => {
    await delay();

    if (error) {
      return HttpResponse.json({ error_msg: error }, { status: 422 });
    }

    if (prUrl) {
      return HttpResponse.json({ status: 'ok', commit_sha: 'abc123', pr_url: prUrl }, { status: 201 });
    }

    return HttpResponse.json({ status: 'ok', commit_sha: 'abc123' }, { status: 200 });
  });
}
