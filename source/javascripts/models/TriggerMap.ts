import { BitriseYml } from './BitriseYml';

export type TriggerMap = Required<BitriseYml>['trigger_map'];
export type Trigger = TriggerMap[number];
