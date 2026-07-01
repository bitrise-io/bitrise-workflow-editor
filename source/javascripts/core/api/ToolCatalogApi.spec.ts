import ToolCatalogApi, { ToolCatalogError } from './ToolCatalogApi';

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response;
}

function errorResponse(status: number): Response {
  return { ok: false, status, json: () => Promise.reject(new Error('no body')) } as unknown as Response;
}

const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('ToolCatalogApi', () => {
  describe('getToolCatalog', () => {
    it('fetches and parses the catalog index, preserving aliases', async () => {
      fetchMock.mockResolvedValue(
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
      expect(fetchMock).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/catalog.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('throws a ToolCatalogError on a network error', async () => {
      const cause = new TypeError('Failed to fetch');
      fetchMock.mockRejectedValue(cause);

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
      await expect(ToolCatalogApi.getToolCatalog()).rejects.toMatchObject({ cause });
    });

    it('throws a ToolCatalogError with the status on a non-2xx response', async () => {
      fetchMock.mockResolvedValue(errorResponse(404));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toMatchObject({ status: 404 });
    });

    it('throws a ToolCatalogError on malformed JSON', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as Response);

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
    });

    it('throws a ToolCatalogError when the payload is missing the tools array', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolCatalog()).rejects.toThrow(ToolCatalogError);
    });
  });

  describe('getToolVersions', () => {
    it('fetches and parses a tool version list, flagging each version as SemVer', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: ['26.4.0', '26.3.1', '24.16.0'], timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [
          { version: '26.4.0', isSemver: true },
          { version: '26.3.1', isSemver: true },
          { version: '24.16.0', isSemver: true },
        ],
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/nodejs.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('flags each version independently in a mixed SemVer / non-SemVer list', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: ['6.3.3', '6.3', 'nightly'] }));

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
      fetchMock.mockResolvedValue(jsonResponse({ versions: [] }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [],
      });
    });

    it('throws a ToolCatalogError on a network error', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toThrow(ToolCatalogError);
    });

    it('throws a ToolCatalogError with the status on a non-2xx response', async () => {
      fetchMock.mockResolvedValue(errorResponse(500));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toMatchObject({ status: 500 });
    });

    it('throws a ToolCatalogError when the payload is missing the versions array', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersions('nodejs')).rejects.toThrow(ToolCatalogError);
    });
  });
});
