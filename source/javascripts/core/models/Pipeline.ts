import { BitriseYml } from './BitriseYml';

type PipelinesYml = Required<BitriseYml>['pipelines'];
type PipelineYmlObject = PipelinesYml[string];
type Pipeline = { id: string; userValues: PipelineYmlObject };

export { Pipeline, PipelinesYml, PipelineYmlObject };
