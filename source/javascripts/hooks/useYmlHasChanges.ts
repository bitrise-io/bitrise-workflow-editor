import YamlUtils from '@/core/utils/YamlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    return !YamlUtils.areDocumentsEqual(s.ymlDocument, s.savedYmlDocument);
  });
}
