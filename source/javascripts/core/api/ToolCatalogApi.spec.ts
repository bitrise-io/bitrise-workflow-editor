import ToolCatalogApi from './ToolCatalogApi';

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
  describe('url builders', () => {
    it('builds the catalog index url', () => {
      expect(ToolCatalogApi.getCatalogIndexUrl()).toBe('https://bitrise.io/stacks/tools/v1/catalog.json');
    });

    it('builds a per-tool catalog url', () => {
      expect(ToolCatalogApi.getToolCatalogUrl('nodejs')).toBe('https://bitrise.io/stacks/tools/v1/nodejs.json');
    });

    it('encodes the tool id', () => {
      expect(ToolCatalogApi.getToolCatalogUrl('weird/id')).toBe('https://bitrise.io/stacks/tools/v1/weird%2Fid.json');
    });
  });

  describe('getToolCatalog', () => {
    it('fetches and parses the catalog index', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ tools: ['nodejs', 'golang', 'python'], timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toEqual({
        toolIds: ['nodejs', 'golang', 'python'],
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/catalog.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('drops non-string entries from the tool list', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ tools: ['nodejs', 42, null, 'python'] }));

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toEqual({ toolIds: ['nodejs', 'python'] });
    });

    it('returns undefined on a network error', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toBeUndefined();
    });

    it('returns undefined on a non-2xx response', async () => {
      fetchMock.mockResolvedValue(errorResponse(404));

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toBeUndefined();
    });

    it('returns undefined on malformed JSON', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as Response);

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toBeUndefined();
    });

    it('returns undefined when the payload is missing the tools array', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolCatalog()).resolves.toBeUndefined();
    });
  });

  describe('getToolVersionCatalog', () => {
    it('fetches and parses a tool version list and flags SemVer compatibility', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: ['26.4.0', '26.3.1', '24.16.0'], timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersionCatalog('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: ['26.4.0', '26.3.1', '24.16.0'],
        isSemver: true,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://bitrise.io/stacks/tools/v1/nodejs.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('flags partially-SemVer lists as SemVer (at least one parseable version)', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: ['6.3.3', '6.3', '6.2.4'] }));

      await expect(ToolCatalogApi.getToolVersionCatalog('swift')).resolves.toEqual({
        toolId: 'swift',
        versions: ['6.3.3', '6.3', '6.2.4'],
        isSemver: true,
      });
    });

    it('flags lists with no parseable version as non-SemVer', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: ['stable', 'nightly', 'edge'] }));

      await expect(ToolCatalogApi.getToolVersionCatalog('custom')).resolves.toEqual({
        toolId: 'custom',
        versions: ['stable', 'nightly', 'edge'],
        isSemver: false,
      });
    });

    it('treats an empty version list as non-SemVer', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ versions: [] }));

      await expect(ToolCatalogApi.getToolVersionCatalog('nodejs')).resolves.toEqual({
        toolId: 'nodejs',
        versions: [],
        isSemver: false,
      });
    });

    it('returns undefined on a network error', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(ToolCatalogApi.getToolVersionCatalog('nodejs')).resolves.toBeUndefined();
    });

    it('returns undefined on a non-2xx response', async () => {
      fetchMock.mockResolvedValue(errorResponse(500));

      await expect(ToolCatalogApi.getToolVersionCatalog('nodejs')).resolves.toBeUndefined();
    });

    it('returns undefined when the payload is missing the versions array', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ timestamp: 'now' }));

      await expect(ToolCatalogApi.getToolVersionCatalog('nodejs')).resolves.toBeUndefined();
    });
  });
});
