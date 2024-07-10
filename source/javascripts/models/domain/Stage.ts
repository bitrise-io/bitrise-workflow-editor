import { BitriseYml } from './BitriseYml';

export type Stages = Required<BitriseYml>['stages'];
export type Stage = Stages[string];
