import { BitriseYml } from './BitriseYml';

type Stages = Required<BitriseYml>['stages'];
type Stage = Stages[string];

export { Stage, Stages };
