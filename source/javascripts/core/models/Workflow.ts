import { WithId } from '@/core/utils/WithId';
import { BitriseYml, Meta } from './BitriseYml';

type Workflows = Required<BitriseYml>['workflows'];
type WorkflowYmlObject = Workflows[string] & {
  meta?: Meta;
  run_if?: string;
};
type Workflow = WithId<WorkflowYmlObject>;
type ChainedWorkflowPlacement = 'before_run' | 'after_run';

export { Workflow, Workflows, ChainedWorkflowPlacement };
