import Client, { ClientError } from './client';
import ToolCatalogApi from './ToolCatalogApi';

function clientError(status: number): ClientError {
  return new ClientError(new Error('boom'), new Response(null, { status }));
}

function networkError(): ClientError {
  // A transport failure has no `Response`, so `ClientError.status` is undefined.
  return new ClientError(new TypeError('Failed to fetch'));
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ToolCatalogApi', () => {
  describe('getToolCatalog', () => {
    it('fetches and parses the catalog index, preserving aliases', async () => {
      jest.spyOn(Client, 'get').mockResolvedValue({
        tools: [
          { name: 'nodejs', aliases: ['node'] },
          { name: 'golang', aliases: ['go'] },
          { name: 'python', aliases: [] },
        ],
        timestamp: 'now',
      });

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toEqual({
        tools: [
          { name: 'nodejs', aliases: ['node'] },
          { name: 'golang', aliases: ['go'] },
          { name: 'python', aliases: [] },
        ],
      });
    });

    // As of July 2026, the tool catalog is available as a set of static json files
    // rather than a proper server. In order to avoid CSRF preflight request, we provide
    // these inputs to the client.
    it('requests it as a CORS-simple GET: CSRF excluded, Content-Type overridden to text/plain', async () => {
      const get = jest.spyOn(Client, 'get').mockResolvedValue({ tools: [] });

      await ToolCatalogApi.getToolCatalog();

      expect(get).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/catalog.json',
        expect.objectContaining({ excludeCSRF: true, headers: { 'Content-Type': 'text/plain' } }),
      );
    });

    it('propagates the ClientError on a network error', async () => {
      const cause = networkError();
      jest.spyOn(Client, 'get').mockRejectedValue(cause);

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toBe(cause);
    });

    it('propagates the ClientError with the status on a non-2xx response', async () => {
      jest.spyOn(Client, 'get').mockRejectedValue(clientError(404));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toMatchObject({ status: 404 });
    });

    it('throws when the payload is missing the tools array', async () => {
      jest.spyOn(Client, 'get').mockResolvedValue({ timestamp: 'now' });

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow('missing a "tools" array');
    });
  });

  describe('getToolVersions', () => {
    it('fetches and parses a tool version list, flagging each version as SemVer', async () => {
      const get = jest
        .spyOn(Client, 'get')
        .mockResolvedValue({ versions: ['26.4.0', '26.3.1', '24.16.0'], timestamp: 'now' });

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [
          { version: '26.4.0', isSemver: true },
          { version: '26.3.1', isSemver: true },
          { version: '24.16.0', isSemver: true },
        ],
      });

      expect(get).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/nodejs.json',
        expect.objectContaining({ excludeCSRF: true, headers: { 'Content-Type': 'text/plain' } }),
      );
    });

    it('flags each version independently in a mixed SemVer / non-SemVer list', async () => {
      jest.spyOn(Client, 'get').mockResolvedValue({ versions: ['6.3.3', '6.3', 'nightly'] });

      await expect(ToolCatalogApi.getToolVersions('swift')).resolves.toEqual({
        toolId: 'swift',
        versions: [
          { version: '6.3.3', isSemver: true },
          { version: '6.3', isSemver: false },
          { version: 'nightly', isSemver: false },
        ],
      });
    });

    it('returns an empty version list unchanged', async () => {
      jest.spyOn(Client, 'get').mockResolvedValue({ versions: [] });

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [],
      });
    });

    it('propagates the ClientError on a network error', async () => {
      const cause = networkError();
      jest.spyOn(Client, 'get').mockRejectedValue(cause);

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toBe(cause);
    });

    it('propagates the ClientError with the status on a non-2xx response', async () => {
      jest.spyOn(Client, 'get').mockRejectedValue(clientError(500));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toMatchObject({ status: 500 });
    });

    it('throws when the payload is missing the versions array', async () => {
      jest.spyOn(Client, 'get').mockResolvedValue({ timestamp: 'now' });

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toThrow('missing a "versions" array');
    });
  });
});
