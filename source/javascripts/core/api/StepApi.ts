import algoliasearch from 'algoliasearch';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import { Maintainer, Step, StepInputVariable, StepVariable, StepYmlObject, VariableOpts } from '@/core/models/Step';
import VersionUtils from '@/core/utils/VersionUtils';
import StepService from '@/core/models/StepService';
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
function toStep(
  cvs: string,
  response: Partial<AlgoliaStepResponse>,
  versions: string[] = [],
): Required<Pick<Step, 'cvs' | 'defaultValues' | 'resolvedInfo'>> | undefined {
  const { version = '' } = StepService.parseStepCVS(cvs);
  if (!response.id) {
    return undefined;
  }

  const title = StepService.resolveTitle(response.cvs || cvs, response.step);
  const icon = StepService.resolveIcon(response.step, response.info);
  const normalizedVersion = VersionUtils.normalizeVersion(version) || VersionUtils.normalizeVersion(response.version);
  const resolvedVersion = response.version || VersionUtils.resolveVersion(version, versions);
  const latestVersion = response.latest_version_number || VersionUtils.resolveVersion('', versions);
  const isLatest = Boolean(response.is_latest);
  const isDeprecated = Boolean(response.is_deprecated);
  const isOfficial = Boolean(response.info?.maintainer === Maintainer.Bitrise && !isDeprecated);
  const isVerified = Boolean(response.info?.maintainer === Maintainer.Verified && !isDeprecated);
  const isCommunity = Boolean(response.info?.maintainer === Maintainer.Community && !isDeprecated);

  return {
    cvs: response.cvs || cvs,
    defaultValues: response.step ?? {},
    resolvedInfo: {
      id: response.id,
      title,
      icon,
      versions,
      version,
      normalizedVersion,
      resolvedVersion,
      latestVersion,
      isLatest,
      isDeprecated,
      isOfficial,
      isVerified,
      isCommunity,
    },
  };
}

function toStepVariable(response: AlgoliaStepInputResponse): StepVariable | undefined {
  if (!response) {
    return undefined;
  }

  const { opts, cvs, is_latest: isLatest, objectID, order, ...variable } = response;
  return { opts, ...variable };
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
    if (StepService.isCustomStepLibStep(cvs)) {
      return getCustomStepByCvs(cvs);
    }

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
  const { id, version } = StepService.parseStepCVS(cvs);
  const { stepsClient } = getAlgoliaClients();
  const results: AlgoliaStepResponse[] = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (batch) => results.push(...batch),
    filters: `id:${id}`,
  });
  const availableVersions = results.map((step) => step.version).filter(Boolean) as string[];
  const resolvedVersion = VersionUtils.resolveVersion(version, availableVersions) || '';

  const inputs = await getAlgoliaStepInputsByCvs(StepService.createStepCVS(id, resolvedVersion));
  const steps = results
    .map((step) => {
      const result = toStep(cvs, step, availableVersions);
      if (result) {
        result.defaultValues.inputs = inputs;
      }
      return result;
    })
    .filter(Boolean) as Step[];
  return steps?.find(
    ({ resolvedInfo }) => resolvedInfo?.resolvedVersion === VersionUtils.resolveVersion(version, availableVersions),
  );
}

async function getCustomStepByCvs(cvs: string): Promise<Step | undefined> {
  if (!/https?:\/\//.test(cvs)) {
    return undefined;
  }

  const { id, version } = StepService.parseStepCVS(cvs);

  // Todo: implement fetching steps with custom steplib url
  return toStep(cvs, { id, version });
}

async function getDirectGitStepByCvs(cvs: string): Promise<Step | undefined> {
  if (!StepService.isGitStep(cvs)) {
    return undefined;
  }

  const { id, version } = StepService.parseStepCVS(cvs);

  // Todo: implement fetching direct git steps from the git repository
  return toStep(cvs, { id, version });
}

async function getLocalStepByCvs(cvs: string): Promise<Step | undefined> {
  if (!StepService.isLocalStep(cvs)) {
    return undefined;
  }

  const { id, version } = StepService.parseStepCVS(cvs);
  const result = await Client.post<{
    step: StepYmlObject;
    info?: StepInfo;
  }>(LOCAL_STEP_API, {
    body: JSON.stringify({ id, version, library: 'path' }),
  });

  return toStep(cvs, result);
}

async function getAlgoliaStepInputsByCvs(cvs: string): Promise<StepInputVariable[]> {
  const { inputsClient } = getAlgoliaClients();
  const results: AlgoliaStepInputResponse[] = [];
  await inputsClient.browseObjects<AlgoliaStepInputResponse>({
    batch: (batch) => results.push(...batch),
    filters: `cvs:${cvs}`,
  });

  return sortBy(results, 'order').map(toStepVariable).filter(Boolean) as StepInputVariable[];
}

export { AlgoliaStepResponse, AlgoliaStepInputResponse, StepInfo };

export default {
  getAlgoliaSteps,
  getAlgoliaStepByCvs,
  getAlgoliaStepInputsByCvs,
  getStepByCvs,
};
