import { BitriseYml } from './BitriseYml';

type TriggerMapYml = Required<BitriseYml>['trigger_map'];
type TriggerYmlObject = TriggerMapYml[number];

export { TriggerMapYml, TriggerYmlObject };
