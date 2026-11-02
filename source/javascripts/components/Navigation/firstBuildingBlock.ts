import { BitriseYml } from '@/core/models/BitriseYml';
import WorkflowService from '@/core/services/WorkflowService';
import { paths } from '@/routes';

// The CI blocks pages, the config section each lists, and the search param that picks an entity.
const KINDS = [
  { page: 'pipelines', path: paths.pipelines, section: 'pipelines', param: 'pipeline' },
  { page: 'workflows', path: paths.workflows, section: 'workflows', param: 'workflow_id' },
  { page: 'step_bundles', path: paths.stepBundles, section: 'step_bundles', param: 'step_bundle_id' },
] as const;

const idsOf = (yml: BitriseYml, section: (typeof KINDS)[number]['section']) => Object.keys(yml[section] ?? {});

// Whether this config has anything to show on a CI blocks page.
function hasBlocksFor(yml: BitriseYml, page: string | undefined) {
  const kind = KINDS.find((k) => k.page === page);
  return Boolean(kind && idsOf(yml, kind.section).length > 0);
}

// The first CI block in the order the sidebar lists them: Pipelines, then Workflows (runnable before
// `_` utility ones), then Step bundles. Undefined for a config with none.
function firstBuildingBlock(yml: BitriseYml) {
  for (const kind of KINDS) {
    const ids = idsOf(yml, kind.section);
    const id =
      kind.section === 'workflows' ? (ids.find((wf) => !WorkflowService.isUtilityWorkflow(wf)) ?? ids[0]) : ids[0];
    if (id) return { path: kind.path, param: kind.param, id };
  }
  return undefined;
}

export type BlockTarget = { path: string; param: string; id: string };

// The CI block a page's URL names, if it's a CI blocks page that names one.
function blockAt(page: string | undefined, params: Record<string, string | undefined>): BlockTarget | undefined {
  const kind = KINDS.find((k) => k.page === page);
  const id = kind ? params[kind.param] : undefined;
  return kind && id ? { path: kind.path, param: kind.param, id } : undefined;
}

// Whether that block is still in this config (it may have been renamed or deleted, or live in another file).
function exists(yml: BitriseYml, target: BlockTarget) {
  const kind = KINDS.find((k) => k.param === target.param);
  return Boolean(kind && idsOf(yml, kind.section).includes(target.id));
}

export default { hasBlocksFor, firstBuildingBlock, blockAt, exists, entityParams: KINDS.map((k) => k.param) };
