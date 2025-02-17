import { CamelCasedProperties } from 'type-fest';
import { GraphPipelineWorkflowModel, WorkflowModel } from './BitriseYml';

export type Workflow = { id: string; userValues: WorkflowModel };
export type ChainedWorkflowPlacement = 'before_run' | 'after_run';
export type PipelineWorkflow = CamelCasedProperties<GraphPipelineWorkflowModel> & {
  id: string;
};
