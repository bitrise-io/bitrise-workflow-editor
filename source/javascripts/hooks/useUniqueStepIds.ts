import BitriseYmlService from '@/core/services/BitriseYmlService';

export default function useUniqueStepIds(): string[];
export default function useUniqueStepIds(as: 'set'): Set<string>;
export default function useUniqueStepIds(as: 'array'): string[];
export default function useUniqueStepIds(as: 'array' | 'set' = 'array') {
  const result = BitriseYmlService.getUniqueStepIds();
  return as === 'set' ? new Set(result) : result;
}
