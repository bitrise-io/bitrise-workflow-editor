import Client, { ClientError } from './client';
import ToolCatalogApi, { ToolCatalogError } from './ToolCatalogApi';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

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
      const raw = jest.spyOn(Client, 'raw').mockResolvedValue(
        jsonResponse({
          tools: [
            { name: 'nodejs', aliases: ['node'] },
            { name: 'golang', aliases: ['go'] },
            { name: 'python', aliases: [] },
          ],
          timestamp: 'now',
        }),
      );

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toEqual({
        tools: [
          { name: 'nodejs', aliases: ['node'] },
          { name: 'golang', aliases: ['go'] },
          { name: 'python', aliases: [] },
        ],
      });
      expect(raw).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/catalog.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    // As of July 2026, the tool catalog is available as a set of static json files
    // rather than a proper server. In order to avoid CSRF preflight request, we provide
    // these inputs to the client.
    it('requests it as a CORS-simple GET: CSRF excluded, Content-Type overridden to text/plain', async () => {
      const raw = jest.spyOn(Client, 'raw').mockResolvedValue(jsonResponse({ tools: [] }));

      await ToolCatalogApi.getToolCatalog();

      expect(raw).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/catalog.json',
        expect.objectContaining({ excludeCSRF: true, headers: { 'Content-Type': 'text/plain' } }),
      );
    });

    it('throws a ToolCatalogError (wrapping the ClientError) on a network error', async () => {
      const cause = networkError();
      jest.spyOn(Client, 'raw').mockRejectedValue(cause);

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
      await expect(ToolCatalogApi.getToolCatalog()).rejects.toMatchObject({ cause });
    });

    it('throws a ToolCatalogError with the status on a non-2xx response', async () => {
      jest.spyOn(Client, 'raw').mockRejectedValue(clientError(404));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toMatchObject({ status: 404 });
    });

    it('throws a ToolCatalogError on malformed JSON', async () => {
      jest.spyOn(Client, 'raw').mockResolvedValue(new Response('<html>not json</html>', { status: 200 }));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
    });

    it('throws a ToolCatalogError when the payload is missing the tools array', async () => {
      jest.spyOn(Client, 'raw').mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
    });
  });

  describe('getToolVersions', () => {
    it('fetches and parses a tool version list, flagging each version as SemVer', async () => {
      const raw = jest
        .spyOn(Client, 'raw')
        .mockResolvedValue(jsonResponse({ versions: ['26.4.0', '26.3.1', '24.16.0'], timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [
          { version: '26.4.0', isSemver: true },
          { version: '26.3.1', isSemver: true },
          { version: '24.16.0', isSemver: true },
        ],
      });
      expect(raw).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/nodejs.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('flags each version independently in a mixed SemVer / non-SemVer list', async () => {
      jest.spyOn(Client, 'raw').mockResolvedValue(jsonResponse({ versions: ['6.3.3', '6.3', 'nightly'] }));

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
      jest.spyOn(Client, 'raw').mockResolvedValue(jsonResponse({ versions: [] }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [],
      });
    });

    it('throws a ToolCatalogError on a network error', async () => {
      jest.spyOn(Client, 'raw').mockRejectedValue(networkError());

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toThrow(ToolCatalogError);
    });

    it('throws a ToolCatalogError with the status on a non-2xx response', async () => {
      jest.spyOn(Client, 'raw').mockRejectedValue(clientError(500));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toMatchObject({ status: 500 });
    });

    it('throws a ToolCatalogError when the payload is missing the versions array', async () => {
      jest.spyOn(Client, 'raw').mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toThrow(ToolCatalogError);
    });
  });
});
