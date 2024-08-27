import { BitriseYml } from './BitriseYml';

type Stages = Required<BitriseYml>['stages'];
type StageYmlObject = Stages[string];
type Stage = { id: string; userValues: StageYmlObject };

export { Stage, Stages, StageYmlObject };
