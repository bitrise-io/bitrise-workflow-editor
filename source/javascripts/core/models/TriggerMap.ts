import { BitriseYml } from './BitriseYml';

type TriggerMap = Required<BitriseYml>['trigger_map'];
type Trigger = TriggerMap[number];

export { TriggerMap, Trigger };
