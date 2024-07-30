import { BitriseYml } from './BitriseYml';
import { WithId } from '@/core/WithId';

export type Pipelines = Required<BitriseYml>['pipelines'];
export type PipelineObject = Pipelines[string];
export type Pipeline = WithId<PipelineObject>;
