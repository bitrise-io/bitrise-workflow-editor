import { WithId } from './WithId';
import { BitriseYml } from './BitriseYml';

type Stages = Required<BitriseYml>['stages'];
type StageObject = Stages[string];
type Stage = WithId<StageObject>;

export { Stage, Stages, StageObject };
