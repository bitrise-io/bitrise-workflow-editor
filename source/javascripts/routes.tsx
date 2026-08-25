import { lazyWithPreload } from 'react-lazy-with-preload';

import { EntityDeepLink, EntityKind } from '@/core/models/Tree';

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

/**
 * The entity a router location addresses — `#!/workflows?workflow_id=deploy` → the `deploy`
 * workflow. `undefined` when the location isn't an entity page, or carries no entity id.
 */
export function deepLinkedEntity(location: string): EntityDeepLink | undefined {
  const [path, search] = location.replace(/^#?!?\/?/, '').split('?');
  const route = ENTITY_DEEP_LINKS.find(({ path: entityPath }) => `/${path}`.startsWith(entityPath));
  const id = route && new URLSearchParams(search).get(route.param);
  return id ? { kind: route.kind, id } : undefined;
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

export function preloadRoutes() {
  routes.forEach((route) => {
    route.component.preload();
  });
}
