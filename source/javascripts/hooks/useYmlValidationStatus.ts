import { configStatus } from '@/core/stores/BitriseYmlStore';

import useBitriseYmlStore from './useBitriseYmlStore';

function useYmlValidationStatus() {
  return useBitriseYmlStore((s) => {
    // YAML that doesn't parse, in the open file or any other, makes the config invalid whatever the
    // markers say. Monaco would report it only after a flicker, and only for the root file, so saving
    // could write another file's broken text.
    if (!configStatus(s).everyFileParses) {
      return 'invalid' as const;
    }

    return s.validationStatus;
  });
}

export default useYmlValidationStatus;
