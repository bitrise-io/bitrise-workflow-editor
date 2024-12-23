import algoliasearch from 'algoliasearch';
import { sortBy, uniqBy } from 'es-toolkit';
import { parse } from 'yaml';
import {
  BITRISE_STEP_LIBRARY_SSH_URL,
  BITRISE_STEP_LIBRARY_URL,
  LibraryType,
  Maintainer,
  Step,
  StepInputVariable,
  StepVariable,
  StepYmlObject,
  VariableOpts,
} from '@/core/models/Step';
import VersionUtils from '@/core/utils/VersionUtils';
import StepService from '@/core/models/StepService';
import Client from '@/core/api/client';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

const ALGOLIA_APP_ID = 'HI1538U2K4';
const ALGOLIA_API_KEY = '708f890e859e7c44f309a1bbad3d2de8';
const ALGOLIA_STEPLIB_STEPS_INDEX = 'steplib_steps';
const ALGOLIA_STEPLIB_INPUTS_INDEX = 'steplib_inputs';

// TYPES
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

type StepApiResult = Required<Omit<Step, 'userValues' | 'mergedValues'>> | undefined;

type StepLibrarySpecResponse = {
  library_map: Record<string, StepLibrary>;
};

type StepLibrary = {
  steps: Record<string, StepVersionCollection>;
};

type StepVersionCollection = {
  info?: StepInfo;
  latest_version_number: string;
  versions: Record<string, StepYmlObject>;
};

// TRANSFORMATIONS
function toStep(
  cvs: string,
  defaultStepLibrary: string,
  response: Partial<AlgoliaStepResponse>,
  versions: string[] = [],
): StepApiResult {
  const { id, version = '' } = StepService.parseStepCVS(cvs, defaultStepLibrary);
  if (!response.id) {
    return undefined;
  }

  const title = StepService.resolveTitle(response.cvs || cvs, defaultStepLibrary, response.step);
  const icon = StepService.resolveIcon(cvs, defaultStepLibrary, response.step, response.info);
  const normalizedVersion = VersionUtils.normalizeVersion(version);
  const resolvedVersion = response.version || VersionUtils.resolveVersion(version, versions);
  const latestVersion = response.latest_version_number || VersionUtils.resolveVersion('', versions);
  const isLatest = Boolean(response.is_latest);
  const isDeprecated = Boolean(response.is_deprecated);
  const isOfficial = Boolean(response.info?.maintainer === Maintainer.Bitrise && !isDeprecated);
  const isVerified = Boolean(response.info?.maintainer === Maintainer.Verified && !isDeprecated);
  const isCommunity = Boolean(response.info?.maintainer === Maintainer.Community && !isDeprecated);

  return {
    cvs: response.cvs || cvs,
    id: response.id || id,
    title,
    icon,
    defaultValues: response.step ?? {},
    resolvedInfo: {
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
const LOCAL_STEP_LIBRARY_PATH = '/api/spec';

function getAlgoliaClients() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  return {
    stepsClient: client.initIndex(ALGOLIA_STEPLIB_STEPS_INDEX),
    inputsClient: client.initIndex(ALGOLIA_STEPLIB_INPUTS_INDEX),
  };
}

async function getAlgoliaSteps(defaultStepLibrary: string): Promise<StepApiResult[]> {
  const { stepsClient } = getAlgoliaClients();
  const results: Array<AlgoliaStepResponse> = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: 'is_latest:true AND is_deprecated:false',
  });
  return uniqBy(results, (r) => r.id)
    .map((step) => toStep(step.cvs, defaultStepLibrary, step))
    .filter(Boolean) as StepApiResult[];
}

async function getStepByCvs(cvs: string, defaultStepLibrary: string): Promise<StepApiResult | undefined> {
  const { library } = StepService.parseStepCVS(cvs, defaultStepLibrary);
  switch (library) {
    case LibraryType.BUNDLE:
    case LibraryType.WITH:
      return undefined;
    case LibraryType.BITRISE:
      return getAlgoliaStepByCvs(cvs, defaultStepLibrary);
    case LibraryType.LOCAL:
      return getLocalStepByCvs(cvs, defaultStepLibrary);
    case LibraryType.GIT:
      return getDirectGitStepByCvs(cvs, defaultStepLibrary);
    case LibraryType.CUSTOM:
    default:
      return getCustomStepByCvs(cvs, defaultStepLibrary);
  }
}

async function getAlgoliaStepByCvs(cvs: string, defaultStepLibrary: string): Promise<StepApiResult | undefined> {
  const { library, url, id, version } = StepService.parseStepCVS(cvs, defaultStepLibrary);
  const { stepsClient } = getAlgoliaClients();
  const results: AlgoliaStepResponse[] = [];

  if (library !== LibraryType.BITRISE || ![BITRISE_STEP_LIBRARY_URL, BITRISE_STEP_LIBRARY_SSH_URL].includes(url)) {
    throw new Error('Step library is not Bitrise step library');
  }

  if (!id) {
    throw new Error('Step ID not specified');
  }

  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (batch) => results.push(...batch),
    filters: `id:${id}`,
  });
  const availableVersions = results.map((step) => step.version).filter(Boolean) as string[];
  const resolvedVersion = VersionUtils.resolveVersion(version, availableVersions) || '';

  const inputs = await getAlgoliaStepInputsByCvs(StepService.updateVersion(id, defaultStepLibrary, resolvedVersion));
  const steps = results
    .map((step) => {
      const result = toStep(cvs, defaultStepLibrary, step, availableVersions);
      if (result) {
        result.defaultValues.inputs = inputs;
      }
      return result;
    })
    .filter(Boolean) as StepApiResult[];
  return steps?.find(
    (step) => step?.resolvedInfo?.resolvedVersion === VersionUtils.resolveVersion(version, availableVersions),
  );
}

const CustomStepCache = new Map<string, StepLibrarySpecResponse>();

async function getCustomStepByCvs(cvs: string, defaultStepLibrary: string): Promise<StepApiResult | undefined> {
  const { library, url, id, version } = StepService.parseStepCVS(cvs, defaultStepLibrary);

  if (library !== LibraryType.CUSTOM) {
    throw new Error('Step library is not a custom library');
  }

  if (!url) {
    throw new Error('URL is not specified');
  }

  let result = CustomStepCache.get(url);

  if (!result) {
    result = await Client.post<StepLibrarySpecResponse>(LOCAL_STEP_LIBRARY_PATH, {
      body: JSON.stringify({ libraries: [url] }),
      cache: 'force-cache',
    });
    if (result) {
      CustomStepCache.set(url, result);
    }
  }

  const requestedVersion = version || result?.library_map[url]?.steps[id]?.latest_version_number;
  const stepYml = requestedVersion ? result?.library_map[url]?.steps[id]?.versions[requestedVersion] : undefined;

  return toStep(cvs, defaultStepLibrary, { id, version, step: stepYml ?? {} });
}

async function getDirectGitStepByCvs(cvs: string, defaultStepLibrary: string): Promise<StepApiResult | undefined> {
  const { library, version } = StepService.parseStepCVS(cvs, defaultStepLibrary);

  if (library !== LibraryType.GIT) {
    throw new Error('Library is not a git library');
  }

  const id = StepService.getHttpsGitUrl(cvs, defaultStepLibrary);

  if (!id) {
    throw new Error('Git URL not specified');
  }

  let stepYml: StepYmlObject;

  if (RuntimeUtils.isLocalMode()) {
    const result = await Client.post<{ step: StepYmlObject }>(LOCAL_STEP_API, {
      body: JSON.stringify({ id, library: 'git', version }),
    });
    stepYml = result?.step ?? {};
  } else {
    const url = StepService.getRawGitUrl(cvs, defaultStepLibrary);
    if (url.startsWith('https://gitlab.com')) {
      const result = await Client.get<{ content: string }>(url);
      stepYml = parse(atob(result.content)) as StepYmlObject;
    } else {
      const result = await Client.text(url, {
        excludeCSRF: true,
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'text/plain',
        },
      });
      stepYml = parse(result) as StepYmlObject;
    }
  }

  return toStep(cvs, defaultStepLibrary, { id, step: stepYml });
}

async function getLocalStepByCvs(cvs: string, defaultStepLibrary: string): Promise<StepApiResult | undefined> {
  if (RuntimeUtils.isWebsiteMode()) {
    throw new Error('Local steps are not supported in website mode');
  }

  const { library, url, version } = StepService.parseStepCVS(cvs, defaultStepLibrary);

  if (library !== LibraryType.LOCAL) {
    throw new Error('Library is not a local library');
  }

  if (!url) {
    throw new Error('Path not specified');
  }

  const result = await Client.post<{
    step: StepYmlObject;
    info?: StepInfo;
  }>(LOCAL_STEP_API, {
    body: JSON.stringify({ id: url, version, library: 'path' }),
  });

  return toStep(cvs, defaultStepLibrary, result ?? {});
}

async function getAlgoliaStepInputsByCvs(cvs: string): Promise<StepInputVariable[]> {
  const { inputsClient } = getAlgoliaClients();
  const results: AlgoliaStepInputResponse[] = [];
  await inputsClient.browseObjects<AlgoliaStepInputResponse>({
    batch: (batch) => results.push(...batch),
    filters: `cvs:${cvs}`,
  });

  return sortBy(results, [(r) => r.order])
    .map(toStepVariable)
    .filter(Boolean) as StepInputVariable[];
}

export { AlgoliaStepResponse, AlgoliaStepInputResponse, StepInfo, StepApiResult };

export default {
  getAlgoliaSteps,
  getAlgoliaStepByCvs,
  getAlgoliaStepInputsByCvs,
  getStepByCvs,
};
