/**
 * @jest-environment jsdom
 */

import { Maintainer } from '../models/Step';
import AlgoliaApi from './AlgoliaApi';

jest.mock('algoliasearch', () => {
  const mockSearchSingleIndex = jest.fn();
  const mockBrowseObjects = jest.fn();

  return {
    algoliasearch: jest.fn(() => ({
      searchSingleIndex: mockSearchSingleIndex,
      browseObjects: mockBrowseObjects,
    })),
  };
});

jest.mock('search-insights', () => jest.fn());

// Access the mocked module and cast to jest mocks
import { algoliasearch } from 'algoliasearch';

const client = algoliasearch('', '');
const mockSearchSingleIndex = client.searchSingleIndex as jest.Mock;
const mockBrowseObjects = client.browseObjects as jest.Mock;

describe('AlgoliaApi', () => {
  beforeAll(() => {
    (window as any).env = { NODE_ENV: 'test', MODE: 'WEBSITE' };
  });

  beforeEach(() => {
    mockSearchSingleIndex.mockClear();
    mockSearchSingleIndex.mockResolvedValue({ hits: [] });
    mockBrowseObjects.mockClear();
    mockBrowseObjects.mockResolvedValue(undefined);

    (window as any).parent = {
      pageProps: {
        limits: {},
      },
    };
  });

  describe('searchSteps with allowNonBitriseSteps flag', () => {
    it('should include all maintainers when allowNonBitriseSteps is true', () => {
      (window as any).parent.pageProps.limits.allowNonBitriseSteps = true;

      const maintainers = [Maintainer.Bitrise, Maintainer.Verified, Maintainer.Community];
      AlgoliaApi.searchSteps('test', [], maintainers);

      expect(mockSearchSingleIndex).toHaveBeenCalledWith(
        expect.objectContaining({
          searchParams: expect.objectContaining({
            facetFilters: expect.arrayContaining([maintainers.map((m) => `info.maintainer:${m}`)]),
          }),
        }),
      );
    });

    it('should filter to only bitrise maintainer when allowNonBitriseSteps is false', () => {
      (window as any).parent.pageProps.limits.allowNonBitriseSteps = false;

      const maintainers = [Maintainer.Verified, Maintainer.Community];
      AlgoliaApi.searchSteps('test', [], maintainers);

      const lastCall = mockSearchSingleIndex.mock.calls[mockSearchSingleIndex.mock.calls.length - 1][0];
      const facetFilters = lastCall.searchParams.facetFilters;

      expect(facetFilters[3]).toEqual(['info.maintainer:bitrise']);
    });

    it('should default to bitrise maintainer when allowNonBitriseSteps is false and no maintainers selected', () => {
      (window as any).parent.pageProps.limits.allowNonBitriseSteps = false;

      AlgoliaApi.searchSteps('test', [], []);

      expect(mockSearchSingleIndex).toHaveBeenCalledWith(
        expect.objectContaining({
          searchParams: expect.objectContaining({
            facetFilters: expect.arrayContaining([[Maintainer.Bitrise].map((m) => `info.maintainer:${m}`)]),
          }),
        }),
      );
    });

    it('should allow all steps when allowNonBitriseSteps is undefined (default)', () => {
      delete (window as any).parent.pageProps.limits.allowNonBitriseSteps;

      const maintainers = [Maintainer.Verified, Maintainer.Community];
      AlgoliaApi.searchSteps('test', [], maintainers);

      expect(mockSearchSingleIndex).toHaveBeenCalledWith(
        expect.objectContaining({
          searchParams: expect.objectContaining({
            facetFilters: expect.arrayContaining([maintainers.map((m) => `info.maintainer:${m}`)]),
          }),
        }),
      );
    });
  });

  describe('getAllSteps with allowNonBitriseSteps flag', () => {
    it('should include all steps when allowNonBitriseSteps is true', async () => {
      (window as any).parent.pageProps.limits.allowNonBitriseSteps = true;

      await AlgoliaApi.getAllSteps();

      expect(mockBrowseObjects).toHaveBeenCalledWith(
        expect.objectContaining({
          browseParams: expect.objectContaining({
            filters: 'is_latest:true AND is_deprecated:false',
          }),
        }),
      );
    });

    it('should filter to only bitrise maintainer when allowNonBitriseSteps is false', async () => {
      (window as any).parent.pageProps.limits.allowNonBitriseSteps = false;

      await AlgoliaApi.getAllSteps();

      expect(mockBrowseObjects).toHaveBeenCalledWith(
        expect.objectContaining({
          browseParams: expect.objectContaining({
            filters: 'is_latest:true AND is_deprecated:false AND info.maintainer:bitrise',
          }),
        }),
      );
    });

    it('should include all steps when allowNonBitriseSteps is undefined (default)', async () => {
      delete (window as any).parent.pageProps.limits.allowNonBitriseSteps;

      await AlgoliaApi.getAllSteps();

      expect(mockBrowseObjects).toHaveBeenCalledWith(
        expect.objectContaining({
          browseParams: expect.objectContaining({
            filters: 'is_latest:true AND is_deprecated:false',
          }),
        }),
      );
    });
  });
});
