import { BitriseYml } from './BitriseYml';

export type Pipelines = Required<BitriseYml>['pipelines'];
export type Pipeline = Pipelines[string];
