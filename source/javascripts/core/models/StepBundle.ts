import { StepBundleModel } from './BitriseYml';

export type StepBundleBasedOnSource = 'step_bundles' | 'workflows';

export const STEP_BUNDLE_KEYS = [
  'title',
  'summary',
  'description',
  'envs',
  'inputs',
  'steps',
] as const satisfies readonly (keyof StepBundleModel)[];
