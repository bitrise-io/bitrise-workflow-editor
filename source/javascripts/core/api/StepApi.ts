import algoliasearch from 'algoliasearch';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import { Maintainer, Step, StepInputVariable, VariableOpts } from '@/core/models/Step';
import CvsUtils from '@/core/utils/CvsUtils';
import VersionUtils from '@/core/utils/VersionUtils';
import defaultIcon from '../../../images/step/icon-default.svg';

const ALGOLIA_APP_ID = 'HI1538U2K4';
const ALGOLIA_API_KEY = '708f890e859e7c44f309a1bbad3d2de8';
const ALGOLIA_STEPLIB_STEPS_INDEX = 'steplib_steps';
const ALGOLIA_STEPLIB_INPUTS_INDEX = 'steplib_inputs';

// DTOs
type AlgoliaStepResponse = Partial<{
  readonly objectID: string;
  id: string;
  cvs: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<Step>;
  info: {
    maintainer?: Maintainer;
    asset_urls?: Step['asset_urls'] & {
      'icon.svg'?: string;
      'icon.png'?: string;
    };
  };
}>;

type AlgoliaStepInputResponse = {
  readonly objectID: string;
  cvs: string;
  order: number;
  opts: VariableOpts;
  is_latest: boolean;
  [key: string]: unknown;
};

// TRANSFORMATIONS
function toStep(response: AlgoliaStepResponse, availableVersions?: string[]): Step | undefined {
  if (!response.id || !response.cvs) {
    return undefined;
  }

  return {
    ...response.step,
    info: {
      id: response.id,
      cvs: response.cvs,
      icon:
        response.info?.asset_urls?.['icon.svg'] ||
        response.info?.asset_urls?.['icon.png'] ||
        response.step?.asset_urls?.['icon.svg'] ||
        response.step?.asset_urls?.['icon.png'] ||
        defaultIcon,
      isOfficial: response.info?.maintainer === Maintainer.Bitrise && !response.is_deprecated,
      isVerified: response.info?.maintainer === Maintainer.Verified && !response.is_deprecated,
      isCommunity: response.info?.maintainer === Maintainer.Community && !response.is_deprecated,
      isDeprecated: Boolean(response.is_deprecated),
    },
    versionInfo: {
      availableVersions,
      version: response.version || '',
      selectedVersion: VersionUtils.normalizeVersion(response.version),
      resolvedVersion: VersionUtils.resolveVersion(
        response.version,
        response.latest_version_number || '',
        availableVersions,
      ),
      latestVersion: response.latest_version_number,
      isLatest: Boolean(response.is_latest),
    },
  };
}

function toStepInput(response: AlgoliaStepInputResponse): StepInputVariable | undefined {
  if (!response) {
    return undefined;
  }

  const { opts, cvs, is_latest: isLatest, objectID, order, ...input } = response;
  return { opts, ...input };
}

// API CALLS
function getAlgoliaClients() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  return {
    stepsClient: client.initIndex(ALGOLIA_STEPLIB_STEPS_INDEX),
    inputsClient: client.initIndex(ALGOLIA_STEPLIB_INPUTS_INDEX),
  };
}

async function getAllSteps(): Promise<Step[]> {
  const { stepsClient } = getAlgoliaClients();
  const results: Array<AlgoliaStepResponse> = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: 'is_latest:true AND is_deprecated:false',
  });
  return uniqBy(results, 'id')
    .map((step) => toStep(step))
    .filter(Boolean) as Step[];
}

async function getStepByCvs(cvs: string): Promise<Step | undefined> {
  const [id, version] = CvsUtils.parseStepCVS(cvs);
  const { stepsClient } = getAlgoliaClients();
  const results: AlgoliaStepResponse[] = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (batch) => results.push(...batch),
    filters: `id:${id}`,
  });
  const availableVersions = results.map((step) => step.version).filter(Boolean) as string[];
  const latestVersion = results[0].latest_version_number || '';
  return results
    .map((step) => toStep(step, availableVersions))
    .find(
      (step) =>
        step?.versionInfo?.resolvedVersion === VersionUtils.resolveVersion(version, latestVersion, availableVersions),
    );
}

async function getStepInputsByCvs(cvs: string): Promise<StepInputVariable[]> {
  const { inputsClient } = getAlgoliaClients();
  const results: AlgoliaStepInputResponse[] = [];
  await inputsClient.browseObjects<AlgoliaStepInputResponse>({
    batch: (batch) => results.push(...batch),
    filters: `cvs:${cvs}`,
  });

  return sortBy(results, 'order').map(toStepInput).filter(Boolean) as StepInputVariable[];
}

export { AlgoliaStepResponse, AlgoliaStepInputResponse };

export default {
  getAllSteps,
  getStepByCvs,
  getStepInputsByCvs,
};
