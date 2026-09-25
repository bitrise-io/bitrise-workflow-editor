import { hasYmlChanges } from '@/core/stores/BitriseYmlStore';

import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore(hasYmlChanges);
}
