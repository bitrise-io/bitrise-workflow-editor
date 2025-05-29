/* eslint-disable no-underscore-dangle */
import YamlUtils from '@/core/utils/YamlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    return s.__invalidYmlString !== undefined || !YamlUtils.areDocumentsEqual(s.ymlDocument, s.savedYmlDocument);
  });
}
