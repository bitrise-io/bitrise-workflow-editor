import { lazy } from 'react';

export const paths = {
  workflows: '/workflows',
  pipelines: '/pipelines',
  stepBundles: '/step_bundles',
  secrets: '/secrets',
  envVars: '/env_vars',
  triggers: '/triggers',
  stacksAndMachines: '/stacks',
  licenses: '/licenses',
  yml: '/yml',
};

export const routes = [
  {
    path: paths.workflows,
    component: lazy(() => import('./pages/WorkflowsPage/WorkflowsPage')),
  },
  {
    path: paths.pipelines,
    component: lazy(() => import('./pages/PipelinesPage/PipelinesPage')),
  },
  {
    path: paths.stepBundles,
    component: lazy(() => import('./pages/StepBundlesPage/StepBundlesPage')),
  },
  {
    path: paths.secrets,
    component: lazy(() => import('./pages/SecretsPage/SecretsPage')),
  },
  {
    path: paths.envVars,
    component: lazy(() => import('./pages/EnvVarsPage/EnvVarsPage')),
  },
  {
    path: paths.triggers,
    component: lazy(() => import('./pages/TriggersPage/TriggersPage')),
  },
  {
    path: paths.stacksAndMachines,
    component: lazy(() => import('./pages/StacksAndMachinesPage/StacksAndMachinesPage')),
  },
  {
    path: paths.licenses,
    component: lazy(() => import('./pages/LicensesPage/LicensesPage')),
  },
  {
    path: paths.yml,
    component: lazy(() => import('./pages/YmlPage/YmlPage')),
  },
];
