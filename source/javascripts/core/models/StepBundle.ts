import { StepBundleModel } from './BitriseYml';

export type StepBundleCreationSource = 'step_bundles' | 'workflows';

export const STEP_BUNDLE_KEYS = [
  'title',
  'summary',
  'description',
  'envs',
  'inputs',
  'steps',
  'is_always_run',
  'run_if',
  'execution_container',
  'service_containers',
] as const satisfies readonly (keyof StepBundleModel)[];
