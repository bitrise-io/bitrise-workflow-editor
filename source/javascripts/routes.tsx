import { lazy } from 'react';

export const paths = {
  pipelines: '/pipelines',
  workflows: '/workflows',
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
    component: lazy(() =>
      import('./pages/WorkflowsPage/WorkflowsPage').then((module) => ({
        default: module.WorkflowsPageContent,
      })),
    ),
  },
  {
    path: paths.pipelines,
    component: lazy(() =>
      import('./pages/PipelinesPage/PipelinesPage').then((module) => ({
        default: module.PipelinesPageContent,
      })),
    ),
  },
  {
    path: paths.stepBundles,
    component: lazy(() =>
      import('./pages/StepBundlesPage/StepBundlesPage').then((module) => ({
        default: module.StepBundlesPageContent,
      })),
    ),
  },
  {
    path: paths.secrets,
    component: lazy(() =>
      import('./pages/SecretsPage/SecretsPage').then((module) => ({
        default: module.SecretsPageContent,
      })),
    ),
  },
  {
    path: paths.envVars,
    component: lazy(() =>
      import('./pages/EnvVarsPage/EnvVarsPage').then((module) => ({
        default: module.EnvVarsPageContent,
      })),
    ),
  },
  {
    path: paths.triggers,
    component: lazy(() =>
      import('./pages/TriggersPage/TriggersPage').then((module) => ({
        default: module.TriggersPageContent,
      })),
    ),
  },
  {
    path: paths.stacksAndMachines,
    component: lazy(() =>
      import('./pages/StacksAndMachinesPage/StacksAndMachinesPage').then((module) => ({
        default: module.StacksAndMachinesPageContent,
      })),
    ),
  },
  {
    path: paths.licenses,
    component: lazy(() =>
      import('./pages/LicensesPage/LicensesPage').then((module) => ({
        default: module.LicensesPageContent,
      })),
    ),
  },
  {
    path: paths.yml,
    component: lazy(() =>
      import('./pages/YmlPage/YmlPage').then((module) => ({
        default: module.YmlPageContent,
      })),
    ),
  },
];
