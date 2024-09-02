import { WithId } from './WithId';
import { Workflow } from './Workflow';

enum Maintainer {
  Bitrise = 'bitrise',
  Verified = 'verified',
  Community = 'community',
}

type Steps = Required<Workflow>['steps'];
type StepObject = Extract<Steps[number][string], { website?: string }>;
type Step = WithId<StepObject>;

type StepInput = {
  id: string;
  cvs: string;
};

export function parseStepCVS(cvs: string) {
  const cleaned = cvs.replace(/^(git::|path::|git@)/g, '');
  const parts = cleaned.split('@');
  const id = parts[0].split('/').pop();
  const version = parts.length > 1 ? parts.pop() : '';

  return [id, version] as const;
}

export function isStepLib(cvs: string) {
  return !/^(git::|path::|git@)/g.test(cvs);
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

export { Step, Steps, StepObject, Maintainer, StepInput };
