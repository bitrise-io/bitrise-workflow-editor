import TriggerService from '@/core/services/TriggerService';

import useBitriseYmlStore from './useBitriseYmlStore';

const useLegacyTriggers = () => {
  const triggerMap = useBitriseYmlStore((state) => state.yml?.trigger_map);
  return TriggerService.toLegacyTriggers(triggerMap);
};

export default useLegacyTriggers;
