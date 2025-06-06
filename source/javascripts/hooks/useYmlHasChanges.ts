/* eslint-disable no-underscore-dangle */
import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    if (s.__invalidYmlString && s.__savedInvalidYmlString) {
      return s.__invalidYmlString !== s.__savedInvalidYmlString; // If the invalid YML strings are different, we consider it as a change
    }

    // Check if the current YML document is different from the saved one
    return !!s.__invalidYmlString || !YmlUtils.isEquals(s.ymlDocument, s.savedYmlDocument);
  });
}
