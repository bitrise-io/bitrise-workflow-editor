import gtr from 'semver/ranges/gtr';
import { Workflow } from './Workflow';

export type Steps = Required<Workflow>['steps'];

export type Step = Omit<Extract<Steps[number][string], { website?: string }>, 'inputs' | 'outputs'> & {
  inputs?: { [x: string]: unknown; opts?: StepInputOptions }[];
  outputs?: { [x: string]: unknown; opts?: StepOutputOptions }[];
};

export type DockerStep = Extract<Steps[number][string], { container?: string }>;

export type StepInputOptions = Partial<{
  title: string;
  summary: string;
  category: string;
  description: string;
  value_options: string[];
  unset: boolean;
  is_expand: boolean;
  is_template: boolean;
  is_required: boolean;
  is_sensitive: boolean;
  skip_if_empty: boolean;
  is_dont_change_value: boolean;
}>;

export type StepOutputOptions = StepInputOptions;

export function parseStepCVS(cvs: string) {
  const cleaned = cvs.replace(/^(git::|path::|bundle::|with)/g, '');
  const parts = cleaned.split('@');
  return [parts[0], parts[1] || undefined] as const;
}

export function isStepLib(cvs: string, _step?: Steps[number][string]): _step is Step {
  return /^(git::|path::|bundle::|with)/g.test(cvs) === false;
}

export function isGitStep(cvs: string, _step?: Steps[number][string]): _step is Step {
  return /^git::/g.test(cvs);
}

export function isLocalStep(cvs: string, _step?: Steps[number][string]): _step is Step {
  return /^path::/g.test(cvs);
}

export function isStepBundle(cvs: string, _step?: Steps[number][string]): _step is Step {
  return /^bundle::/g.test(cvs);
}

export function isDockerStep(cvs: string, _step?: Steps[number][string]): _step is DockerStep {
  return cvs === 'with';
}

export function normalizeStepVersion(version: string) {
  if (/^(\d+)(\.\d+)?$/g.test(version)) {
    const match = version.split('.');
    const major = match[0];
    const minor = match[1] || 'x';
    return `${major}.${minor}.x`;
  }
  return version;
}

export function isUpgradeableStep(resolvedVersion?: string, availableVersions?: string[]) {
  if (!availableVersions || !resolvedVersion) {
    return false;
  }

  return availableVersions.some((possibleVersion) => gtr(possibleVersion, resolvedVersion));
}
