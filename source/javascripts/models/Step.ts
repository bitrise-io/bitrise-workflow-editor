import { Workflow } from './Workflow';

export type Steps = Required<Workflow>['steps'];
export type Step = Extract<Steps[number][string], { website?: string }>;

export function parseStepCVS(cvs: string) {
  const cleaned = cvs.replace(/^(git::|path::|git@)/g, '');
  const parts = cleaned.split('@');
  const id = parts[0].split('/').pop();
  const version = parts.length > 1 ? parts.pop() : '';

  return [id, version] as const;
}

export function isStepLib(cvs: string) {
  return /^(git::|path::|git@)/g.test(cvs) === false;
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
