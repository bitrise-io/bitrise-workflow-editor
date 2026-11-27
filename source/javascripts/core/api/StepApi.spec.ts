/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://app.bitrise.io/"}
 */
import { BITRISE_STEP_LIBRARY_URL } from '@/core/models/Step';

import StepApi from './StepApi';

function setMode(mode?: string) {
  (window as unknown as { env: { MODE?: string } }).env = { MODE: mode };
}

describe('loading a git:: step on the website', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    setMode('WEBSITE');
    document.cookie = 'CSRF-TOKEN=session-token; path=/';
    global.fetch = fetchMock;
  });

  afterEach(() => {
    setMode(undefined);
    fetchMock.mockReset();
    document.cookie = 'CSRF-TOKEN=; path=/; max-age=0';
  });

  it("doesn't send the CSRF token to GitLab", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: btoa('title: From GitLab') }),
    });

    const step = await StepApi.getStepByCvs(
      'git::https://gitlab.com/steplib/steps-fastlane.git@main',
      BITRISE_STEP_LIBRARY_URL,
    );

    expect(step?.defaultValues?.title).toBe('From GitLab');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=main');
    expect(options.headers).not.toHaveProperty('X-CSRF-TOKEN');
  });

  it.each([
    ['a path on app.bitrise.io', 'git::/app/some/path?x=1#'],
    ['app.bitrise.io itself', 'git::https://app.bitrise.io/app/some/path?x=1#'],
    ['a host that only starts with github.com', 'git::https://github.com.evil.example/org/step.git'],
    ['an unknown host', 'git::https://evil.example/org/step.git'],
  ])("doesn't request %s", async (_, cvs) => {
    await expect(StepApi.getStepByCvs(cvs, BITRISE_STEP_LIBRARY_URL)).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
