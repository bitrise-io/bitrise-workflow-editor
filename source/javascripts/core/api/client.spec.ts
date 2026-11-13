/**
 * An RDE session's address, so jsdom's cookie store handles the .bitrise.dev cookie as the browser does
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://50116-secret.web-rde.bitrise.dev/"}
 */
import BitriseYmlApi from './BitriseYmlApi';

// The names web-dev-env gives the website's CSRF cookie on two RDE sessions
const SESSION_COOKIE_NAME = 'CSRF-TOKEN-0b7e3c52-4d1a-4f0e-9a6b-2c8d5e1f7a90';
const OTHER_SESSION_COOKIE_NAME = 'CSRF-TOKEN-5f2a9d61-8c3e-4b7f-a0d4-9e6b1c3f8d27';

// RuntimeUtils.isWebsiteMode() reads window.env.MODE === 'WEBSITE'.
function setMode(mode?: string) {
  (window as unknown as { env: { MODE?: string } }).env = { MODE: mode };
}

// The website's globalProps.env. The editor reads it from window.parent, which is window itself in this test.
function setCsrfCookieName(name?: string) {
  window.globalProps = name ? ({ env: { CSRF_COOKIE_NAME: name } } as typeof window.globalProps) : undefined;
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
    setCsrfCookieName(undefined);
    fetchMock.mockReset();
    document.cookie = 'CSRF-TOKEN=; domain=bitrise.dev; path=/; secure; max-age=0';
    document.cookie = 'CSRF-TOKEN=; path=/; max-age=0';
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${OTHER_SESSION_COOKIE_NAME}=; domain=bitrise.dev; path=/; max-age=0`;
  });

  it('sends the session token from the cookie that globalProps names', async () => {
    setCsrfCookieName(SESSION_COOKIE_NAME);
    document.cookie = `${SESSION_COOKIE_NAME}=rde-token; path=/`;

    await save();

    expect(sentToken()).toBe('rde-token');
  });

  it("doesn't send another session's token, even one on .bitrise.dev", async () => {
    setCsrfCookieName(SESSION_COOKIE_NAME);
    document.cookie = `${OTHER_SESSION_COOKIE_NAME}=other-session-token; domain=bitrise.dev; path=/`;
    document.cookie = `${SESSION_COOKIE_NAME}=rde-token; path=/`;

    await save();

    expect(document.cookie).toContain(`${OTHER_SESSION_COOKIE_NAME}=other-session-token`);
    expect(sentToken()).toBe('rde-token');
  });

  it('sends the first CSRF-TOKEN when globalProps names no cookie, which on RDE can be staging token', async () => {
    document.cookie = 'CSRF-TOKEN=rde-token; path=/';

    await save();

    expect(document.cookie).toBe('CSRF-TOKEN=staging-token; CSRF-TOKEN=rde-token');
    expect(sentToken()).toBe('staging-token');
  });

  it('sends CSRF-TOKEN where the website uses that name', async () => {
    setCsrfCookieName('CSRF-TOKEN');
    document.cookie = 'CSRF-TOKEN=; domain=bitrise.dev; path=/; secure; max-age=0';
    document.cookie = 'CSRF-TOKEN=session-token; path=/';

    await save();

    expect(sentToken()).toBe('session-token');
  });
});
