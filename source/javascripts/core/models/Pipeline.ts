import { BitriseYml } from './BitriseYml';

type Pipelines = Required<BitriseYml>['pipelines'];
type PipelineYmlObject = Pipelines[string];
type Pipeline = { id: string; userValues: PipelineYmlObject };

export { Pipeline, Pipelines, PipelineYmlObject };
