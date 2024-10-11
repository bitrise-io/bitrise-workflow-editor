import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import keys from 'lodash/keys';
import compact from 'lodash/compact';
import semver from 'semver';
import {
  BITRISE_STEPLIB_URL,
  LibraryType,
  Step,
  StepBundleYmlObject,
  StepInputVariable,
  StepLikeYmlObject,
  Steps,
  StepYmlObject,
  VariableOpts,
  WithGroupYmlObject,
} from '@/core/models/Step';
import type { StepApiResult, StepInfo } from '@/core/api/StepApi';
import VersionUtils from '@/core/utils/VersionUtils';
import defaultIcon from '@/../images/step/icon-default.svg';

// https://devcenter.bitrise.io/en/references/steps-reference/step-reference-id-format.html
// <step_lib_source>::<step-id>@<version>:
function parseStepCVS(
  cvs: string,
  ymlDefaultStepLib: string,
): {
  library: string;
  id: string;
  version: string;
} {
  const [source, version = ''] = cvs.startsWith('git::git@')
    ? [`git@${cvs.split('@')[1]}`, cvs.split('@').pop()]
    : cvs.split('@');
  const id = source.split('::').pop() || source;

  // Example: with
  if (/^(with)$/g.test(cvs)) {
    return { library: LibraryType.WITH, id, version: '' };
  }

  // Example: bundle::name
  if (/^bundle::/g.test(cvs)) {
    return { library: LibraryType.BUNDLE, id, version: '' };
  }

  // Example: path::path/to/step
  if (/^path::/g.test(cvs)) {
    return { library: LibraryType.LOCAL, id, version: '' };
  }

  // Example: git::https://github.com/bitrise-io/steps-script.git@next:
  if (/^git::/g.test(cvs)) {
    return { library: LibraryType.GIT, id, version };
  }

  // Example: https://github.com/bitrise-io/bitrise-steplib.git::script@1
  // Example: https://github.com/foo/bar-steplib.git::step@1
  if (/^https?:\/\/.+::(.+)/g.test(cvs)) {
    const [library, stepId] = source.split('::');

    if (library === BITRISE_STEPLIB_URL) {
      return { library: LibraryType.STEPLIB, id: stepId, version };
    }

    return { library, id: stepId, version };
  }

  if (ymlDefaultStepLib === BITRISE_STEPLIB_URL) {
    return { library: LibraryType.STEPLIB, id, version };
  }

  // Example: script@1
  return { library: ymlDefaultStepLib, id, version };
}

function replaceCVSVersion(cvs: string, defaultStepLibrary: string, version: string | undefined) {
  if (
    isLocalStep(cvs, defaultStepLibrary) ||
    isStepBundle(cvs, defaultStepLibrary) ||
    isWithGroup(cvs, defaultStepLibrary)
  ) {
    return cvs;
  }

  const id = cvs.startsWith('git::git@') ? `git::git@${cvs.split('@')[1]}` : cvs.split('@')[0];
  const denormalizedVersion = VersionUtils.denormalizeVersion(version);
  return version ? `${id}@${denormalizedVersion}` : id;
}

function isStep(cvs: string, defaultStepLibrary: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return !isWithGroup(cvs, defaultStepLibrary, _step) && !isStepBundle(cvs, defaultStepLibrary, _step);
}

function isStepLibStep(cvs: string, defaultStepLibrary: string, _step?: Steps[number][string]): _step is StepYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === 'bitrise-steplib';
}

function isCustomStepLibStep(
  cvs: string,
  defaultStepLibrary: string,
  _step?: Steps[number][string],
): _step is StepYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library.startsWith('https://') || library.startsWith('http://') || library.startsWith('git@');
}

function isGitStep(cvs: string, defaultStepLibrary: string, _step?: Steps[number][string]): _step is StepYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === 'git';
}

function isLocalStep(cvs: string, defaultStepLibrary: string, _step?: Steps[number][string]): _step is StepYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === 'path';
}

function isStepBundle(
  cvs: string,
  defaultStepLibrary: string,
  _step?: Steps[number][string],
): _step is StepBundleYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === 'bundle';
}

function isWithGroup(
  cvs: string,
  defaultStepLibrary: string,
  _step?: Steps[number][string],
): _step is WithGroupYmlObject {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === 'with';
}

function getHttpsGitUrl(cvs: string, defaultStepLibrary: string): string {
  const { library, id } = parseStepCVS(cvs, defaultStepLibrary);

  let url = '';
  switch (library) {
    case 'path':
      break;
    case 'with':
      break;
    case 'bundle':
      break;
    case 'git':
      url = id;
      break;
    case 'bitrise-steplib':
      url = BITRISE_STEPLIB_URL;
      break;
    default:
      url = library;
      break;
  }

  const sshMatch = url.match(/^git@([^:]+):(.+)$/);

  if (sshMatch) {
    const [, host, path] = sshMatch;
    url = `https://${host}/${path}`;
  }

  url = url.replace('http://', 'https://');

  return url;
}

function getRawGitUrl(cvs: string, defaultStepLibrary: string, fallbackBranch: string = 'master'): string {
  const { version } = parseStepCVS(cvs, defaultStepLibrary);
  const branch = version || fallbackBranch;
  let url = getHttpsGitUrl(cvs, defaultStepLibrary);

  if (url.endsWith('.git')) {
    url = url.slice(0, -4);
  }

  if (url.startsWith('https://github.com')) {
    // https: https://github.com/bitrise-io/steps-fastlane.git
    // git@:  git@github.com:bitrise-io/steps-fastlane.git
    // raw:   https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml
    return url.replace('https://github.com', 'https://raw.githubusercontent.com').concat(`/${branch}/step.yml`);
  }
  if (url.startsWith('https://gitlab.com')) {
    // https: https://gitlab.com/steplib/steps-fastlane.git
    // git@:  git@gitlab.com:steplib/steps-fastlane.git
    // raw:   https://gitlab.com/steplib/steps-fastlane/-/raw/master/step.yml - DOES NOT WORK DUE TO CORS POLICY
    // api:   https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=master
    // return url.concat(`/-/raw/${branch}/step.yml`);
    const [group, project] = url.replace('https://gitlab.com/', '').split('/');
    return `https://gitlab.com/api/v4/projects/${group}%2F${project}/repository/files/step.yml?ref=${branch}`;
  }
  if (url.startsWith('https://bitbucket.org')) {
    // clone: https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane.git
    // raw:   https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane/raw/master/step.yml
    return url.concat(`/raw/${branch}/step.yml`);
  }

  return `${url}/step.yml`;
}

function resolveTitle(cvs: string, defaultStepLibrary: string, step?: Steps[number][string]): string {
  if (isStepBundle(cvs, defaultStepLibrary, step)) {
    return `Step bundle: ${cvs.replace('bundle::', '')}`;
  }
  if (isWithGroup(cvs, defaultStepLibrary, step)) {
    return 'With group';
  }

  if (step?.title) {
    return step.title;
  }

  let { id } = parseStepCVS(cvs, defaultStepLibrary);
  id = id.replace(/\.git$/, '');
  return id.split('/').pop() || id;
}

function resolveIcon(cvs: string, defaultStepLibrary: string, step?: StepLikeYmlObject, info?: StepInfo): string {
  if (isWithGroup(cvs, defaultStepLibrary, step) || isStepBundle(cvs, defaultStepLibrary, step)) {
    return defaultIcon;
  }

  return (
    step?.asset_urls?.['icon.svg'] ||
    step?.asset_urls?.['icon.png'] ||
    info?.asset_urls?.['icon.svg'] ||
    info?.asset_urls?.['icon.png'] ||
    defaultIcon
  );
}

function getSelectableVersions(step?: Step): Array<{ value: string; label: string }> {
  const results = [{ value: '', label: 'Always latest' }];

  if (step?.resolvedInfo?.version && /\d+\.\d+\.\d+/g.test(step.resolvedInfo.version)) {
    results.push({
      value: step.resolvedInfo.version,
      label: `${step.resolvedInfo.version} - ${VersionUtils.getVersionRemark(step.resolvedInfo.version)}`,
    });
  }

  const versions = step?.resolvedInfo?.versions;
  if (versions) {
    results.push(
      ...VersionUtils.getNormalizedVersions(versions).map((version) => ({
        value: version,
        label: `${version} - ${VersionUtils.getVersionRemark(version)}`,
      })),
    );
  }

  return results;
}

function getStepCategories(steps: StepApiResult[] | Step[]): string[] {
  return uniq(steps.flatMap((step) => step?.defaultValues?.type_tags || [])).sort();
}

function getInputNames(step?: StepApiResult): string[] {
  if (!step?.defaultValues?.inputs) {
    return [];
  }

  return compact(step.defaultValues.inputs.map((inputObj) => find(keys(inputObj), (k) => k !== 'opts')));
}

function calculateChange(
  oldStep: StepApiResult | undefined,
  newStep: StepApiResult | undefined,
  defaultStepLibrary: string,
): {
  newInputs: string[];
  removedInputs: string[];
  change: 'major' | 'inputs' | 'step-id' | 'none';
} {
  const noChange = {
    newInputs: [],
    removedInputs: [],
    change: 'none' as const,
  };

  if (!oldStep || !newStep) {
    return noChange;
  }

  const { id: oldId } = parseStepCVS(oldStep.cvs, defaultStepLibrary);
  const { id: newId } = parseStepCVS(newStep.cvs, defaultStepLibrary);

  if (oldId !== newId) {
    return { ...noChange, change: 'step-id' };
  }

  const oldVersion = oldStep?.resolvedInfo?.resolvedVersion;
  const newVersion = newStep?.resolvedInfo?.resolvedVersion;

  if (!semver.valid(oldVersion) || !semver.valid(newVersion)) {
    return noChange;
  }

  const versionChange = oldVersion && newVersion && semver.diff(oldVersion, newVersion);

  if (!versionChange) {
    return noChange;
  }

  const oldStepInputs = getInputNames(oldStep);
  const newStepInputs = getInputNames(newStep);
  const removedInputs = oldStepInputs.filter((name) => !newStepInputs.includes(name));
  const newInputs = newStepInputs.filter((name) => !oldStepInputs.includes(name));
  const hasInputChanged = removedInputs.length > 0 || newInputs.length > 0;

  if (!hasInputChanged && versionChange !== 'major') {
    return noChange;
  }

  return {
    removedInputs,
    newInputs,
    change: versionChange === 'major' ? 'major' : 'inputs',
  };
}

function toYmlInput(
  name: string,
  newValue: unknown,
  defaultValue: unknown,
  opts?: VariableOpts,
): StepInputVariable | undefined {
  if (!newValue || newValue === defaultValue) {
    return undefined;
  }

  const result = { [name]: newValue, ...(!isEmpty(opts) ? { opts } : {}) };

  if (typeof defaultValue === 'boolean' && ['true', 'false'].includes(String(newValue))) {
    return { ...result, [name]: String(newValue) === 'true' };
  }

  if (typeof defaultValue === 'number' && !Number.isNaN(Number(newValue))) {
    return { ...result, [name]: Number(newValue) };
  }

  return result;
}

export default {
  parseStepCVS,
  replaceCVSVersion,
  isStep,
  isStepLibStep,
  isCustomStepLibStep,
  isGitStep,
  isLocalStep,
  isStepBundle,
  isWithGroup,
  getHttpsGitUrl,
  getRawGitUrl,
  resolveTitle,
  resolveIcon,
  getSelectableVersions,
  getStepCategories,
  getInputNames,
  calculateChange,
  toYmlInput,
};
