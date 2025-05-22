import { compact, isString, uniq } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import semver from 'semver';
import { Document, isMap, isScalar, Scalar } from 'yaml';

import defaultIcon from '@/../images/step/icon-default.svg';
import { AlgoliaStepInfo } from '@/core/api/AlgoliaApi';
import type { StepApiResult } from '@/core/api/StepApi';
import VersionUtils from '@/core/utils/VersionUtils';

import {
  EnvironmentItemModel,
  EnvironmentItemOptionsModel,
  StepBundleOverrideModel,
  StepListItemModel,
  StepModel,
  WithModel,
} from '../models/BitriseYml';
import { BITRISE_STEP_LIBRARY_SSH_URL, BITRISE_STEP_LIBRARY_URL, LibraryType, Step } from '../models/Step';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';
import EnvVarService from './EnvVarService';

type Source = 'workflows' | 'step_bundles';

// https://devcenter.bitrise.io/en/references/steps-reference/step-reference-id-format.html
// <step_lib_source>::<step-id>@<version>:
function parseStepCVS(
  cvs: string,
  ymlDefaultStepLib: string,
): {
  library: LibraryType;
  url: string;
  id: string;
  version: string;
} {
  // Example: with
  if (/^(with)$/g.test(cvs)) {
    return { library: LibraryType.WITH, url: '', id: 'with', version: '' };
  }

  // Example: bundle::name
  if (/^bundle::/g.test(cvs)) {
    return {
      library: LibraryType.BUNDLE,
      url: '',
      id: cvs.replace('bundle::', ''),
      version: '',
    };
  }

  // Example: path::path/to/step
  if (/^path::/g.test(cvs)) {
    const [url] = cvs.replace('path::', '').split('@');
    return { library: LibraryType.LOCAL, url, id: url, version: '' };
  }

  // Example: git::https://github.com/bitrise-io/steps-script.git@next
  // Example: git::git@github.com:bitrise-io/steps-script.git@next
  if (/^git::/g.test(cvs)) {
    const parts = cvs.replace('git::', '').split('@');
    const url = parts[0] === 'git' ? `git@${parts[1]}` : parts[0];
    const version = (parts[0] === 'git' ? parts[2] : parts[1]) || '';
    return {
      library: LibraryType.GIT,
      url,
      id: url,
      version,
    };
  }

  // Example: https://github.com/bitrise-io/bitrise-steplib.git::script@1
  if (cvs.startsWith(BITRISE_STEP_LIBRARY_URL)) {
    const [, stepReference] = cvs.split('::');
    const [id, version = ''] = stepReference.split('@');
    return {
      library: LibraryType.BITRISE,
      url: BITRISE_STEP_LIBRARY_URL,
      id,
      version,
    };
  }

  // Example: https://custom.step/foo/bar-steplib.git::baz@next
  if (/^https?:\/\/.+::(.+)/g.test(cvs)) {
    const [url, stepReference] = cvs.split('::');
    const [id, version = ''] = stepReference.split('@');
    return { library: LibraryType.CUSTOM, url, id, version };
  }

  // Example: git@github.com:bitrise-io/bitrise-steplib.git::script@1
  if (cvs.startsWith(BITRISE_STEP_LIBRARY_SSH_URL)) {
    const [, stepReference] = cvs.split('::');
    const [id, version = ''] = stepReference.split('@');
    return {
      library: LibraryType.BITRISE,
      url: BITRISE_STEP_LIBRARY_SSH_URL,
      id,
      version,
    };
  }

  // Example: git@custom.step:foo/bar-steplib.git::baz@next
  if (/^git@.+::(.+)/g.test(cvs)) {
    const [url, stepReference] = cvs.split('::');
    const [id, version = ''] = stepReference.split('@');
    return { library: LibraryType.CUSTOM, url, id, version };
  }

  const [url, stepReference] = cvs.includes('::') ? cvs.split('::') : [ymlDefaultStepLib, cvs];
  const source = url || ymlDefaultStepLib;
  const [id, version = ''] = stepReference.split('@');

  if (source === BITRISE_STEP_LIBRARY_URL || source === BITRISE_STEP_LIBRARY_SSH_URL) {
    return { library: LibraryType.BITRISE, url: source, id, version };
  }

  // Example: script@1
  return { library: LibraryType.CUSTOM, url: source, id, version };
}

function canUpdateVersion(cvs: string, defaultStepLibrary: string): boolean {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.BITRISE || library === LibraryType.CUSTOM || library === LibraryType.GIT;
}

function updateVersion(cvs: string, defaultStepLibrary: string, version: string | undefined) {
  if (!canUpdateVersion(cvs, defaultStepLibrary)) {
    return cvs;
  }

  const id = cvs.startsWith('git::git@') ? `git::git@${cvs.split('@')[1]}` : cvs.split('@')[0];
  const denormalizedVersion = VersionUtils.denormalizeVersion(version);
  return version ? `${id}@${denormalizedVersion}` : id;
}

function isStep(cvs: string, defaultStepLibrary: string, _step?: StepListItemModel[0]): _step is StepModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library !== LibraryType.BUNDLE && library !== LibraryType.WITH;
}

function isBitriseLibraryStep(
  cvs: string,
  defaultStepLibrary: string,
  _step?: StepListItemModel[0],
): _step is StepModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.BITRISE;
}

function isCustomLibraryStep(
  cvs: string,
  defaultStepLibrary: string,
  _step?: StepListItemModel[0],
): _step is StepModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.CUSTOM;
}

function isGitStep(cvs: string, defaultStepLibrary: string, _step?: StepListItemModel[0]): _step is StepModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.GIT;
}

function isLocalStep(cvs: string, defaultStepLibrary: string, _step?: StepListItemModel[0]): _step is StepModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.LOCAL;
}

function isStepBundle(
  cvs: string,
  defaultStepLibrary: string,
  _step?: StepListItemModel[0],
): _step is StepBundleOverrideModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.BUNDLE;
}

function isWithGroup(cvs: string, defaultStepLibrary: string, _step?: StepListItemModel[0]): _step is WithModel | null {
  const { library } = parseStepCVS(cvs, defaultStepLibrary);
  return library === LibraryType.WITH;
}

function getHttpsGitUrl(cvs: string, defaultStepLibrary: string): string {
  const { library, url } = parseStepCVS(cvs, defaultStepLibrary);

  let result = '';
  switch (library) {
    case 'bitrise':
    case 'custom':
    case 'git':
      result = url;
      break;
    case 'path':
    case 'bundle':
    case 'with':
    default:
      break;
  }

  const sshMatch = result.match(/^git@([^:]+):(.+)$/);

  if (sshMatch) {
    const [, host, path] = sshMatch;
    result = `https://${host}/${path}`;
  }

  result = result.replace('http://', 'https://');

  return result;
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

function resolveTitle(cvs: string, defaultStepLibrary: string, step?: StepListItemModel[0]): string {
  if (isStepBundle(cvs, defaultStepLibrary, step)) {
    return step?.title || cvs.replace('bundle::', '');
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

function resolveIcon(
  cvs: string,
  defaultStepLibrary: string,
  step?: StepListItemModel[0],
  info?: AlgoliaStepInfo,
): string {
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

  return compact(step.defaultValues.inputs.map((inputObj) => Object.keys(inputObj).find((k) => k !== 'opts')));
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
  opts?: EnvironmentItemOptionsModel,
): EnvironmentItemModel | undefined {
  if (!newValue || !String(newValue).trim()) {
    return undefined;
  }

  const result = { [name]: newValue, ...(!isEmpty(opts) ? { opts } : {}) };

  if (['true', 'false'].includes(String(newValue))) {
    return { ...result, [name]: String(newValue) === 'true' };
  }

  if (!Number.isNaN(Number(newValue))) {
    return { ...result, [name]: Number(newValue) };
  }

  return result;
}

export const moveStepIndices = (
  action: 'move' | 'clone' | 'remove',
  indices: number[],
  stepIndex: number,
  targetIndex: number = -1,
): number[] => {
  switch (action) {
    case 'move':
      return indices.map((i) => {
        if (i === stepIndex) {
          return targetIndex;
        }
        if (stepIndex < targetIndex && i > stepIndex && i <= targetIndex) {
          return i - 1;
        }
        if (stepIndex > targetIndex && i < stepIndex && i >= targetIndex) {
          return i + 1;
        }
        return i;
      });
    case 'clone':
      return indices.map((i) => {
        if (i >= stepIndex) {
          return i + 1;
        }
        return i;
      });
    case 'remove':
      return indices.map((i) => {
        if (i >= stepIndex) {
          return i - 1;
        }
        return i;
      });
    default:
      return indices;
  }
};

function getSourceOrThrowError(source: Source, sourceId: string, doc: Document) {
  const entity = doc.getIn([source, sourceId]);

  if (!entity || !isMap(entity)) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getStepOrThrowError(source: Source, sourceId: string, stepIndex: number, doc: Document) {
  const entity = getSourceOrThrowError(source, sourceId, doc);
  const step = entity.getIn(['steps', stepIndex]);

  if (!step || !isMap(step)) {
    throw new Error(`Step at index ${stepIndex} not found in ${source}.${sourceId}`);
  }

  return step;
}

function addStep(source: Source, sourceId: string, cvs: string, to: number) {
  updateBitriseYmlDocument(({ doc }) => {
    getSourceOrThrowError(source, sourceId, doc);

    const steps = YamlUtils.getSeqIn(doc, [source, sourceId, 'steps'], true);
    steps.items.splice(to, 0, doc.createNode({ [cvs]: {} }));

    return doc;
  });
}

function moveStep(source: Source, sourceId: string, from: number, to: number) {
  updateBitriseYmlDocument(({ doc }) => {
    const step = getStepOrThrowError(source, sourceId, from, doc);
    const steps = YamlUtils.getSeqIn(doc, [source, sourceId, 'steps'], true);

    steps.items.splice(from, 1);
    steps.items.splice(to, 0, step);

    return doc;
  });
}

function cloneStep(source: Source, sourceId: string, index: number) {
  updateBitriseYmlDocument(({ doc }) => {
    const step = getStepOrThrowError(source, sourceId, index, doc);
    const steps = YamlUtils.getSeqIn(doc, [source, sourceId, 'steps'], true);

    steps.items.splice(index + 1, 0, step.clone());

    return doc;
  });
}

function deleteStep(source: Source, sourceId: string, indices: number | number[]) {
  updateBitriseYmlDocument(({ doc }) => {
    // Sort indices in descending order to handle the shifting problem
    // By removing higher indices first, we avoid affecting the position of lower indices
    const indexArray = Array.isArray(indices) ? [...indices].sort((a, b) => b - a) : [indices];

    indexArray.forEach((index) => {
      getStepOrThrowError(source, sourceId, index, doc);
      YamlUtils.safeDeleteIn(doc, [source, sourceId, 'steps', index], ['steps']);
    });

    return doc;
  });
}

type Key = keyof StepModel;
type Value<T extends Key> = StepModel[T];

function updateStepField<T extends Key>(source: Source, sourceId: string, index: number, field: T, value: Value<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const step = getStepOrThrowError(source, sourceId, index, doc);
    const stepData = step.items[0].value;

    if (!isMap(stepData)) {
      return doc;
    }

    if (value) {
      stepData.flow = false;
      stepData.set(field, value);
    } else {
      stepData.delete(field);
    }

    return doc;
  });
}

function updateStepInput(source: Source, sourceId: string, index: number, input: string, value: unknown) {
  updateBitriseYmlDocument(({ doc }) => {
    const cvs = (getStepOrThrowError(source, sourceId, index, doc).items[0].key as Scalar).value;
    const inputsSeq = YamlUtils.getSeqIn(doc, [source, sourceId, 'steps', index, cvs, 'inputs'], true);
    const [inputPair, inputIndex] = YamlUtils.getPairInSeqByKey(inputsSeq, input, true);

    const newValue = EnvVarService.toYmlValue(value);
    if (newValue === '') {
      YamlUtils.safeDeleteIn(doc, [source, sourceId, 'steps', index, cvs, 'inputs', inputIndex], ['inputs']);
    } else {
      inputPair.value = EnvVarService.toYmlValue(value);
    }

    return doc;
  });
}

function changeStepVersion(source: Source, sourceId: string, index: number, version: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const step = getStepOrThrowError(source, sourceId, index, doc);
    const stepCVSScalar = step.items[0].key;

    if (!isScalar(stepCVSScalar) || !isString(stepCVSScalar.value)) {
      return doc;
    }

    const cvs = stepCVSScalar.value;
    const defaultStepLibrary = (doc.get('default_step_lib_source') as string) || BITRISE_STEP_LIBRARY_URL;

    stepCVSScalar.value = updateVersion(cvs, defaultStepLibrary, version);

    return doc;
  });
}

export default {
  parseStepCVS,
  canUpdateVersion,
  updateVersion,
  isStep,
  isBitriseLibraryStep,
  isCustomLibraryStep,
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
  moveStepIndices,
  addStep,
  moveStep,
  cloneStep,
  deleteStep,
  updateStepField,
  updateStepInput,
  changeStepVersion,
};
