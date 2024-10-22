import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { BITRISE_STEP_LIBRARY_URL } from '@/core/models/Step';

function useDefaultStepLibrary(): string {
  return useBitriseYmlStore((store) => store.yml.default_step_lib_source || BITRISE_STEP_LIBRARY_URL);
}

export default useDefaultStepLibrary;
