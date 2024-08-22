import { BitriseYml, Meta } from './BitriseYml';

type Workflows = Required<BitriseYml>['workflows'];
type Workflow = Workflows[string] & {
  meta?: Meta;
  run_if?: string;
};
type ChainedWorkflowPlacement = 'before_run' | 'after_run';

export { Workflow, Workflows, ChainedWorkflowPlacement };
