/**
 * An RDE session's address, so jsdom's cookie store handles the .bitrise.dev cookie as the browser does
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://50116-secret.web-rde.bitrise.dev/"}
 */
import BitriseYmlApi from './BitriseYmlApi';

// RuntimeUtils.isWebsiteMode() reads window.env.MODE === 'WEBSITE'.
function setMode(mode?: string) {
  (window as unknown as { env: { MODE?: string } }).env = { MODE: mode };
}

describe('the CSRF token of a save', () => {
  const fetchMock = jest.fn();

  const save = () => BitriseYmlApi.saveCiConfig({ data: 'format_version: "13"', projectSlug: 'app-1' });
  const sentToken = () => fetchMock.mock.calls[0][1].headers['X-CSRF-TOKEN'];

  beforeEach(() => {
    setMode('WEBSITE');
    fetchMock.mockResolvedValue({ ok: true, status: 204, headers: { get: () => null } });
    global.fetch = fetchMock;
    // Staging's cookie is older than the session's own, and the browser lists the older first
    document.cookie = 'CSRF-TOKEN=staging-token; domain=bitrise.dev; path=/; secure';
  });

  afterEach(() => {
    setMode(undefined);
    fetchMock.mockReset();
    document.cookie = 'CSRF-TOKEN=; domain=bitrise.dev; path=/; secure; max-age=0';
    document.cookie = 'CSRF-TOKEN=; path=/; max-age=0';
    document.cookie = '__Host-CSRF-TOKEN=; path=/; secure; max-age=0';
  });

  it('sends the session token from __Host-CSRF-TOKEN, the name the website uses on RDE', async () => {
    document.cookie = '__Host-CSRF-TOKEN=rde-token; path=/; secure';

    await save();

    expect(sentToken()).toBe('rde-token');
  });

  it('sends the first CSRF-TOKEN when there is no __Host-CSRF-TOKEN, which on RDE can be staging token', async () => {
    document.cookie = 'CSRF-TOKEN=rde-token; path=/';

    await save();

    expect(document.cookie).toBe('CSRF-TOKEN=staging-token; CSRF-TOKEN=rde-token');
    expect(sentToken()).toBe('staging-token');
  });

  it('sends CSRF-TOKEN where the website uses that name', async () => {
    document.cookie = 'CSRF-TOKEN=; domain=bitrise.dev; path=/; secure; max-age=0';
    document.cookie = 'CSRF-TOKEN=session-token; path=/';

    await save();

    expect(sentToken()).toBe('session-token');
  });
});
