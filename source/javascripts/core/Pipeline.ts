import { WithId } from './WithId';
import { BitriseYml } from './BitriseYml';

export type Pipelines = Required<BitriseYml>['pipelines'];
export type PipelineObject = Pipelines[string];
export type Pipeline = WithId<PipelineObject>;
