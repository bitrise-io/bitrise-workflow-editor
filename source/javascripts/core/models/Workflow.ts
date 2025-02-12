import { BitriseYml, Meta } from './BitriseYml';

type Workflows = Required<BitriseYml>['workflows'];
type WorkflowYmlObject = Workflows[string] & {
  meta?: Meta;
  run_if?: string;
};
type Workflow = { id: string; userValues: WorkflowYmlObject };
type ChainedWorkflowPlacement = 'before_run' | 'after_run';
type PipelineWorkflow = { id: string; dependsOn: string[]; uses?: string; parallel?: number };

export { Workflow, WorkflowYmlObject, Workflows, ChainedWorkflowPlacement, PipelineWorkflow };
