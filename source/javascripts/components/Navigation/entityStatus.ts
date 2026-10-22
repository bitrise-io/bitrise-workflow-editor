import {
  PipelineModel,
  StepBundleModel,
  Steps,
  TriggerMap,
  TriggersModel,
  WorkflowModel,
} from '@/core/models/BitriseYml';
import { TriggerType, TYPE_MAP } from '@/core/models/Trigger';
import TriggerService from '@/core/services/TriggerService';

// What the CI blocks list says about an entity beyond its name: whether it starts on its own, and
// whether it points at something that doesn't exist. Messages carry no customer names: they show in tooltips.

type IsDefined = (kind: 'workflows' | 'stepBundles', id: string) => boolean;

const BUNDLE_PREFIX = 'bundle::';

// Step bundles a list of Steps uses, including those inside `with` groups.
function bundleIds(steps: Steps | undefined): string[] {
  return (steps ?? []).flatMap((step) =>
    Object.entries(step ?? {}).flatMap(([cvs, model]) => {
      if (cvs.startsWith(BUNDLE_PREFIX)) return [cvs.slice(BUNDLE_PREFIX.length)];
      if (cvs === 'with') return bundleIds((model as { steps?: Steps } | null)?.steps);
      return [];
    }),
  );
}

function pipelineProblem(pipeline: PipelineModel | null | undefined, isDefined: IsDefined): string | undefined {
  const workflows = pipeline?.workflows ?? {};
  const ids = Object.keys(workflows);
  if (ids.some((id) => !isDefined('workflows', workflows[id]?.uses ?? id))) {
    return 'Runs a Workflow that doesn’t exist';
  }
  if (ids.some((id) => (workflows[id]?.depends_on ?? []).some((parent) => !ids.includes(parent)))) {
    return 'Waits for a Workflow that isn’t in this Pipeline';
  }
  return undefined;
}

function workflowProblem(workflow: WorkflowModel | null | undefined, isDefined: IsDefined): string | undefined {
  const chained = [...(workflow?.before_run ?? []), ...(workflow?.after_run ?? [])];
  if (chained.some((id) => !isDefined('workflows', id))) {
    return 'Chains a Workflow that doesn’t exist';
  }
  if (bundleIds(workflow?.steps).some((id) => !isDefined('stepBundles', id))) {
    return 'Uses a Step bundle that doesn’t exist';
  }
  return undefined;
}

function stepBundleProblem(bundle: StepBundleModel | null | undefined, isDefined: IsDefined): string | undefined {
  if (bundleIds(bundle?.steps).some((id) => !isDefined('stepBundles', id))) {
    return 'Uses a Step bundle that doesn’t exist';
  }
  return undefined;
}

// The trigger types that would start each Pipeline and Workflow, keyed `pipelines#id` / `workflows#id`.
// Disabled triggers (or a disabled set) don't count; the legacy trigger map does.
function activeTriggerTypes(
  pipelines: Record<string, { triggers?: TriggersModel } | null>,
  workflows: Record<string, { triggers?: TriggersModel } | null>,
  triggerMap: TriggerMap | undefined,
): Record<string, TriggerType[]> {
  const result: Record<string, TriggerType[]> = {};
  const add = (key: string, type: TriggerType) => {
    result[key] = result[key]?.includes(type) ? result[key] : [...(result[key] ?? []), type];
  };

  (
    [
      ['pipelines', pipelines],
      ['workflows', workflows],
    ] as const
  ).forEach(([source, entities]) =>
    Object.entries(entities).forEach(([id, entity]) => {
      if (entity?.triggers?.enabled === false) return;
      const triggers = TriggerService.toTargetBasedTriggers(source, id, entity?.triggers ?? {});
      (Object.keys(triggers) as TriggerType[]).forEach((type) => {
        if (triggers[type].some((trigger) => trigger.isActive)) add(`${source}#${id}`, type);
      });
    }),
  );

  const legacy = TriggerService.toLegacyTriggers(triggerMap);
  (Object.keys(legacy) as TriggerType[]).forEach((type) =>
    legacy[type].forEach((trigger) => {
      if (trigger.isActive && trigger.source) add(trigger.source, type);
    }),
  );

  return result;
}

function triggerSummary(types: TriggerType[] | undefined): string | undefined {
  if (!types?.length) return undefined;
  const names = types.map((type) => TYPE_MAP[type].toLowerCase());
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Starts on ${list}`;
}

export default { pipelineProblem, workflowProblem, stepBundleProblem, activeTriggerTypes, triggerSummary };
