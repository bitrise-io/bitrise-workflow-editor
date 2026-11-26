/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:4000/2.5.0/?token=launch-token#!/workflows?workflow_id=wf1"}
 */
import Client from './client';
import LocalApiToken from './localApiToken';

describe('the local API token', () => {
  const fetchMock = jest.fn();
  const sentAuthorization = () => fetchMock.mock.calls[0][1].headers.Authorization;

  beforeAll(() => {
    (window as unknown as { env: { MODE?: string } }).env = { MODE: 'CLI' };
    LocalApiToken.capture();
  });

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, headers: { get: () => null } });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('is taken out of the address bar, keeping the route', () => {
    expect(window.location.href).toBe('http://localhost:4000/2.5.0/#!/workflows?workflow_id=wf1');
  });

  it('survives a reload of the tab', () => {
    expect(sessionStorage.getItem('wfe-local-api-token')).toBe('launch-token');
  });

  it('is sent to the local API', async () => {
    await Client.post('/api/bitrise-yml');

    expect(sentAuthorization()).toBe('Bearer launch-token');
  });

  it('is not sent anywhere else', async () => {
    await Client.post('https://bitrise.io/stacks/tools/v1');

    expect(sentAuthorization()).toBeUndefined();
  });
});
