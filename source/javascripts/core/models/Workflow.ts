import { BitriseYml, Meta } from './BitriseYml';

type Workflows = Required<BitriseYml>['workflows'];
type WorkflowYmlObject = Workflows[string] & {
  meta?: Meta;
  run_if?: string;
  status_report_name?: string;
};
type Workflow = { id: string; userValues: WorkflowYmlObject };
type ChainedWorkflowPlacement = 'before_run' | 'after_run';

export { Workflow, WorkflowYmlObject, Workflows, ChainedWorkflowPlacement };
