import BitriseYmlService from '@/core/services/BitriseYmlService';

import useBitriseYmlStore from './useBitriseYmlStore';

export default function useUniqueStepIds(): string[];
export default function useUniqueStepIds(as: 'set'): Set<string>;
export default function useUniqueStepIds(as: 'array'): string[];
export default function useUniqueStepIds(as: 'array' | 'set' = 'array') {
  return useBitriseYmlStore(({ yml }) => {
    const result = BitriseYmlService.getUniqueStepIds(yml);
    return as === 'set' ? new Set(result) : result;
  });
}
