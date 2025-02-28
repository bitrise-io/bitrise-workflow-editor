import aa from 'search-insights';
import algoliasearch from 'algoliasearch';
import { sortBy, uniqBy } from 'es-toolkit';

import GlobalProps from '@/core/utils/GlobalProps';

import { Maintainer } from '../models/Step';
import { EnvironmentItemOptionsModel, StepModel } from '../models/BitriseYml';
import RuntimeUtils from '../utils/RuntimeUtils';

type AlgoliaStepResponse = {
  readonly objectID: string;
  id: string;
  cvs: string;
  version: string;
  is_latest: boolean;
  is_deprecated: boolean;
  latest_version_number: string;
  step: Partial<StepModel>;
  info?: AlgoliaStepInfo;
};

type AlgoliaStepInfo = {
  maintainer?: Maintainer;
  asset_urls?: StepModel['asset_urls'] & {
    'icon.svg'?: string;
    'icon.png'?: string;
  };
};

type AlgoliaStepInputResponse = {
  readonly objectID: string;
  cvs: string;
  order: number;
  opts: EnvironmentItemOptionsModel;
  is_latest: boolean;
  [key: string]: unknown;
};

const ALGOLIA_APP_ID = 'HI1538U2K4';
const ALGOLIA_API_KEY = '708f890e859e7c44f309a1bbad3d2de8';
const ALGOLIA_STEPLIB_STEPS_INDEX = 'steplib_steps';
const ALGOLIA_STEPLIB_INPUTS_INDEX = 'steplib_inputs';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const stepsIndex = client.initIndex(ALGOLIA_STEPLIB_STEPS_INDEX);
const inputsIndex = client.initIndex(ALGOLIA_STEPLIB_INPUTS_INDEX);

aa('init', {
  useCookie: true,
  appId: ALGOLIA_APP_ID,
  apiKey: ALGOLIA_API_KEY,
  authenticatedUserToken: GlobalProps.userSlug(),
});

// Search Functions
function searchSteps(query: string, categories: string[], maintainers: string[]) {
  return stepsIndex.search<AlgoliaStepResponse>(query, {
    hitsPerPage: 1000,
    analytics: RuntimeUtils.isProduction(),
    clickAnalytics: RuntimeUtils.isProduction(),
    facetFilters: [
      'is_latest:true',
      'is_deprecated:false',
      categories.map((category) => `step.type_tags:${category}`),
      maintainers.map((maintainer) => `info.maintainer:${maintainer}`),
    ],
  });
}

// Browse Functions
async function getAllSteps() {
  const results: Array<AlgoliaStepResponse> = [];

  await stepsIndex.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: 'is_latest:true AND is_deprecated:false',
  });

  return uniqBy(results, (r) => r.id);
}

async function getAllStepsById(id: string) {
  const results: Array<AlgoliaStepResponse> = [];

  await stepsIndex.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: `id:${id}`,
  });

  return results;
}

async function getStepInputsByCvs(cvs: string) {
  const results: AlgoliaStepInputResponse[] = [];

  await inputsIndex.browseObjects<AlgoliaStepInputResponse>({
    batch: (batch) => results.push(...batch),
    filters: `cvs:${cvs}`,
  });

  return sortBy(results, [(r) => r.order]);
}

// Tracking Functions
function trackStepSelected(queryId: string, objectId: string, position: number) {
  aa('clickedObjectIDsAfterSearch', {
    queryID: queryId,
    objectIDs: [objectId],
    positions: [position],
    eventName: 'Step Selected',
    index: ALGOLIA_STEPLIB_STEPS_INDEX,
    authenticatedUserToken: GlobalProps.userSlug(),
  });
}

export default {
  searchSteps,
  getAllSteps,
  getAllStepsById,
  getStepInputsByCvs,
  trackStepSelected,
};

export type { AlgoliaStepResponse, AlgoliaStepInputResponse, AlgoliaStepInfo };
