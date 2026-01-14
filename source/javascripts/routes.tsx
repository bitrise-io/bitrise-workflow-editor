import { lazyWithPreload } from 'react-lazy-with-preload';

export const paths = {
  workflows: '/workflows',
  pipelines: '/pipelines',
  stepBundles: '/step_bundles',
  secrets: '/secrets',
  envVars: '/env_vars',
  triggers: '/triggers',
  containers: '/containers',
  stacksAndMachines: '/stacks',
  licenses: '/licenses',
  yml: '/yml',
};

export const routes = [
  {
    path: paths.workflows,
    component: lazyWithPreload(() => import('./pages/WorkflowsPage/WorkflowsPage')),
  },
  {
    path: paths.pipelines,
    component: lazyWithPreload(() => import('./pages/PipelinesPage/PipelinesPage')),
  },
  {
    path: paths.stepBundles,
    component: lazyWithPreload(() => import('./pages/StepBundlesPage/StepBundlesPage')),
  },
  {
    path: paths.secrets,
    component: lazyWithPreload(() => import('./pages/SecretsPage/SecretsPage')),
  },
  {
    path: paths.envVars,
    component: lazyWithPreload(() => import('./pages/EnvVarsPage/EnvVarsPage')),
  },
  {
    path: paths.triggers,
    component: lazyWithPreload(() => import('./pages/TriggersPage/TriggersPage')),
  },
  {
    path: paths.containers,
    component: lazyWithPreload(() => import('./pages/ContainersPage/ContainersPage')),
  },
  {
    path: paths.stacksAndMachines,
    component: lazyWithPreload(() => import('./pages/StacksAndMachinesPage/StacksAndMachinesPage')),
  },
  {
    path: paths.licenses,
    component: lazyWithPreload(() => import('./pages/LicensesPage/LicensesPage')),
  },
  {
    path: paths.yml,
    component: lazyWithPreload(() => import('./pages/YmlPage/YmlPage')),
  },
];

export function preloadRoutes() {
  routes.forEach((route) => {
    route.component.preload();
  });
}
