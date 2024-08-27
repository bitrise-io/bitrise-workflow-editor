import algoliasearch from 'algoliasearch';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import { Maintainer, Step, StepInputVariable, StepYmlObject, VariableOpts } from '@/core/models/Step';
import VersionUtils from '@/core/utils/VersionUtils';
import StepService from '@/core/models/StepService';
import defaultIcon from '@/../images/step/icon-default.svg';
import Client from '@/core/api/client';

const ALGOLIA_APP_ID = 'HI1538U2K4';
const ALGOLIA_API_KEY = '708f890e859e7c44f309a1bbad3d2de8';
const ALGOLIA_STEPLIB_STEPS_INDEX = 'steplib_steps';
const ALGOLIA_STEPLIB_INPUTS_INDEX = 'steplib_inputs';

// DTOs
type AlgoliaStepResponse = {
  readonly objectID: string;
  id: string;
  cvs: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<StepYmlObject>;
  info?: StepInfo;
};

type StepInfo = {
  maintainer?: Maintainer;
  asset_urls?: StepYmlObject['asset_urls'] & {
    'icon.svg'?: string;
    'icon.png'?: string;
  };
};

type AlgoliaStepInputResponse = {
  readonly objectID: string;
  cvs: string;
  order: number;
  opts: VariableOpts;
  is_latest: boolean;
  [key: string]: unknown;
};

// TRANSFORMATIONS
function toStep(cvs: string, response: Partial<AlgoliaStepResponse>, versions: string[] = []): Step | undefined {
  const [, version] = StepService.parseStepCVS(cvs);
  if (!response.id || !response.cvs || !response.step) {
    return undefined;
  }

  const latestVersion = response.latest_version_number || '';
  const isDeprecated = Boolean(response.is_deprecated);

  return {
    cvs,
    defaultValues: response.step,
    userValues: undefined, // The values are coming from the bitrise.yml file defined by the user
    mergedValues: undefined, // The merged values of the defaults and user values
    resolvedInfo: {
      id: response.id,
      cvs: response.cvs,
      title: StepService.resolveTitle(cvs, response.step),
      icon: StepService.resolveIcon(response.step, response.info) || defaultIcon,
      versions,
      version: version || '',
      normalizedVersion:
        VersionUtils.normalizeVersion(version) || VersionUtils.normalizeVersion(response.version) || '',
      resolvedVersion: response.version || '',
      latestVersion,
      isLatest: Boolean(response.is_latest),
      isUpgradable: VersionUtils.hasVersionUpgrade(response.version, versions),
      isDeprecated,
      isOfficial: Boolean(response.info?.maintainer === Maintainer.Bitrise && !isDeprecated),
      isVerified: Boolean(response.info?.maintainer === Maintainer.Verified && !isDeprecated),
      isCommunity: Boolean(response.info?.maintainer === Maintainer.Community && !isDeprecated),
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
const LOCAL_STEP_API = '/api/step-info';

function getAlgoliaClients() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  return {
    stepsClient: client.initIndex(ALGOLIA_STEPLIB_STEPS_INDEX),
    inputsClient: client.initIndex(ALGOLIA_STEPLIB_INPUTS_INDEX),
  };
}

async function getAlgoliaSteps(): Promise<Step[]> {
  const { stepsClient } = getAlgoliaClients();
  const results: Array<AlgoliaStepResponse> = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: 'is_latest:true AND is_deprecated:false',
  });
  return uniqBy(results, 'id')
    .map((step) => toStep(step.cvs, step))
    .filter(Boolean) as Step[];
}

async function getStepByCvs(cvs: string): Promise<Step | undefined> {
  if (StepService.isStepLibStep(cvs)) {
    // TODO implement custom steplib steps
    return getAlgoliaStepByCvs(cvs);
  }

  if (StepService.isGitStep(cvs)) {
    return getDirectGitStepByCvs(cvs);
  }

  if (StepService.isLocalStep(cvs)) {
    return getLocalStepByCvs(cvs);
  }

  return undefined;
}

async function getAlgoliaStepByCvs(cvs: string): Promise<Step | undefined> {
  const [id, version] = StepService.parseStepCVS(cvs);
  const { stepsClient } = getAlgoliaClients();
  const results: AlgoliaStepResponse[] = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (batch) => results.push(...batch),
    filters: `id:${id}`,
  });
  const availableVersions = results.map((step) => step.version).filter(Boolean) as string[];
  const latestVersion = results[0].latest_version_number;
  return (results.map((step) => toStep(cvs, step, availableVersions)).filter(Boolean) as Step[]).find(
    ({ resolvedInfo }) =>
      resolvedInfo?.resolvedVersion ===
      VersionUtils.resolveVersion(version, {
        latestVersion,
        availableVersions,
      }),
  );
}

async function getDirectGitStepByCvs(cvs: string): Promise<Step | undefined> {
  if (!StepService.isGitStep(cvs)) {
    return undefined;
  }

  // Todo: implement direct git steps
  return undefined;
}

async function getLocalStepByCvs(cvs: string): Promise<Step | undefined> {
  if (!StepService.isLocalStep(cvs)) {
    return undefined;
  }

  const [id, version = ''] = StepService.parseStepCVS(cvs);
  const result = await Client.post<{
    step: StepYmlObject;
    info?: StepInfo;
  }>(LOCAL_STEP_API, {
    body: JSON.stringify({ id, version, library: 'path' }),
  });

  const model = toStep(cvs, result);
  console.log('getLocalStepByCvs', result, model);
  return model;
}

async function getAlgoliaStepInputsByCvs(cvs: string): Promise<StepInputVariable[]> {
  const { inputsClient } = getAlgoliaClients();
  const results: AlgoliaStepInputResponse[] = [];
  await inputsClient.browseObjects<AlgoliaStepInputResponse>({
    batch: (batch) => results.push(...batch),
    filters: `cvs:${cvs}`,
  });

  return sortBy(results, 'order').map(toStepInput).filter(Boolean) as StepInputVariable[];
}

export { AlgoliaStepResponse, AlgoliaStepInputResponse, StepInfo };

export default {
  getAlgoliaSteps,
  getAlgoliaStepByCvs,
  getAlgoliaStepInputsByCvs,
  getStepByCvs,
};
