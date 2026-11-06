import { datadogRum } from '@datadog/browser-rum';
import { lazyWithPreload } from 'react-lazy-with-preload';

import { EntityKind } from '@/core/models/Tree';

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

// Pages that address a single entity through a search param. Kinds without one (containers,
// project env vars) are reached by page alone, so they can't be deep-linked to an entity.
const ENTITY_DEEP_LINKS: ReadonlyArray<{ kind: EntityKind; path: string; param: string }> = [
  { kind: 'workflows', path: paths.workflows, param: 'workflow_id' },
  { kind: 'pipelines', path: paths.pipelines, param: 'pipeline' },
  { kind: 'stepBundles', path: paths.stepBundles, param: 'step_bundle_id' },
];

/** The search param carrying the entity id on a kind's page; `undefined` for kinds without one. */
export function entityDeepLinkParam(kind: EntityKind): string | undefined {
  return ENTITY_DEEP_LINKS.find((link) => link.kind === kind)?.param;
}

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

// A failed import is cached by the browser for the life of the page, so a failed preload breaks that
// page until a reload. Waiting for a visible tab assumes hidden tabs fail more often; the reported
// visibility state is there to confirm or refute that.
export function preloadRoutes() {
  if (document.visibilityState !== 'visible') {
    document.addEventListener('visibilitychange', preloadRoutes, { once: true });
    return;
  }

  routes.forEach((route) => {
    route.component.preload().catch((error) => {
      datadogRum.addError(error, { source: 'route-preload', visibilityState: document.visibilityState });
    });
  });
}
