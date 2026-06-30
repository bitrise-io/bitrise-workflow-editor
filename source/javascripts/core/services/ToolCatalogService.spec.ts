import ToolCatalogApi from '../api/ToolCatalogApi';
import { ToolVersionCatalog } from '../models/Tools';
import ToolCatalogService from './ToolCatalogService';

const CACHE_TTL_MS = 30 * 60 * 1000;

function versionCatalog(toolId: string, versions: string[], isSemver = true): ToolVersionCatalog {
  return { toolId, versions, isSemver };
}

afterEach(() => {
  ToolCatalogService.clearCache();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('ToolCatalogService', () => {
  describe('getToolCatalog', () => {
    it('returns the fetched catalog', async () => {
      jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({ toolIds: ['nodejs', 'golang'] });

      await expect(ToolCatalogService.getToolCatalog()).resolves.toEqual({ toolIds: ['nodejs', 'golang'] });
    });

    it('caches the result for the session (single fetch for repeated calls)', async () => {
      const spy = jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({ toolIds: ['nodejs'] });

      await ToolCatalogService.getToolCatalog();
      await ToolCatalogService.getToolCatalog();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent in-flight requests', async () => {
      const spy = jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({ toolIds: ['nodejs'] });

      await Promise.all([ToolCatalogService.getToolCatalog(), ToolCatalogService.getToolCatalog()]);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not cache failures — the next call retries', async () => {
      const spy = jest
        .spyOn(ToolCatalogApi, 'getToolCatalog')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ toolIds: ['nodejs'] });

      await expect(ToolCatalogService.getToolCatalog()).resolves.toBeUndefined();
      await expect(ToolCatalogService.getToolCatalog()).resolves.toEqual({ toolIds: ['nodejs'] });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('re-fetches once the cache entry expires (30-minute TTL)', async () => {
      jest.useFakeTimers();
      const spy = jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({ toolIds: ['nodejs'] });

      await ToolCatalogService.getToolCatalog();
      expect(spy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(CACHE_TTL_MS - 1);
      await ToolCatalogService.getToolCatalog();
      expect(spy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2);
      await ToolCatalogService.getToolCatalog();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('clearCache forces a re-fetch', async () => {
      const spy = jest.spyOn(ToolCatalogApi, 'getToolCatalog').mockResolvedValue({ toolIds: ['nodejs'] });

      await ToolCatalogService.getToolCatalog();
      ToolCatalogService.clearCache();
      await ToolCatalogService.getToolCatalog();

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getToolVersionCatalog', () => {
    it('returns the fetched version catalog', async () => {
      jest
        .spyOn(ToolCatalogApi, 'getToolVersionCatalog')
        .mockResolvedValue(versionCatalog('nodejs', ['26.4.0', '24.16.0']));

      await expect(ToolCatalogService.getToolVersionCatalog('nodejs')).resolves.toEqual(
        versionCatalog('nodejs', ['26.4.0', '24.16.0']),
      );
    });

    it('caches each tool independently', async () => {
      const spy = jest
        .spyOn(ToolCatalogApi, 'getToolVersionCatalog')
        .mockImplementation((toolId) => Promise.resolve(versionCatalog(toolId, ['1.0.0'])));

      await ToolCatalogService.getToolVersionCatalog('nodejs');
      await ToolCatalogService.getToolVersionCatalog('nodejs');
      await ToolCatalogService.getToolVersionCatalog('golang');

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('nodejs');
      expect(spy).toHaveBeenCalledWith('golang');
    });

    it('does not cache a failed tool fetch', async () => {
      const spy = jest
        .spyOn(ToolCatalogApi, 'getToolVersionCatalog')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(versionCatalog('nodejs', ['26.4.0']));

      await expect(ToolCatalogService.getToolVersionCatalog('nodejs')).resolves.toBeUndefined();
      await expect(ToolCatalogService.getToolVersionCatalog('nodejs')).resolves.toEqual(
        versionCatalog('nodejs', ['26.4.0']),
      );
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('resolveVersion', () => {
    const nodejs = versionCatalog('nodejs', ['26.4.0', '26.3.1', '26.3.0', '24.16.0', '24.15.0']);

    it('resolves "latest" to the highest released version', () => {
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'latest-released' })).toBe('26.4.0');
    });

    it('resolves "<prefix>:latest" to the highest version within the prefix', () => {
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'latest-released', prefix: '24' })).toBe('24.16.0');
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'latest-released', prefix: '26.3' })).toBe('26.3.1');
    });

    it('resolves an exact version when present', () => {
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'exact', version: '26.3.0' })).toBe('26.3.0');
    });

    it('returns undefined for an exact version that is absent', () => {
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'exact', version: '99.0.0' })).toBeUndefined();
    });

    it('ignores unparseable entries and excludes prereleases when resolving "latest"', () => {
      const ruby = versionCatalog('ruby', ['4.1-dev', '4.0.5', '4.0.0-preview3', '3.4.9']);
      expect(ToolCatalogService.resolveVersion(ruby, { strategy: 'latest-released' })).toBe('4.0.5');
    });

    it('resolves "<prefix>:latest" across a mixed/partial version list', () => {
      const swift = versionCatalog('swift', ['6.3.3', '6.3', '6.2.4', '6.2', '6.1.3']);
      expect(ToolCatalogService.resolveVersion(swift, { strategy: 'latest-released', prefix: '6.2' })).toBe('6.2.4');
    });

    it('returns undefined for installed/unset strategies the catalog cannot resolve', () => {
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'latest-installed' })).toBeUndefined();
      expect(ToolCatalogService.resolveVersion(nodejs, { strategy: 'unset' })).toBeUndefined();
    });

    it('returns undefined when no version is available', () => {
      expect(
        ToolCatalogService.resolveVersion(versionCatalog('nodejs', [], false), { strategy: 'latest-released' }),
      ).toBeUndefined();
    });

    it('returns undefined for a non-SemVer tool (versions are opaque strings)', () => {
      const custom = versionCatalog('custom', ['stable', 'nightly'], false);
      expect(ToolCatalogService.resolveVersion(custom, { strategy: 'latest-released' })).toBeUndefined();
    });
  });
});
