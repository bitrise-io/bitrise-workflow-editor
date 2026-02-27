import { StepBundles } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

/**
 * Returns step bundles from the active file.
 * When `withMerged` is true, includes step bundles from the merged state
 * (for selectors/reference resolution). Active file entries take precedence.
 */
export function useStepBundles<U = StepBundles>(
  selectorOrOptions?: ((state: StepBundles) => U) | { withMerged?: boolean },
  selectorArg?: (state: StepBundles) => U,
): U {
  const mergedYml = useMergedBitriseYml();

  let withMerged = false;
  let selector: ((state: StepBundles) => U) | undefined;

  if (typeof selectorOrOptions === 'function') {
    selector = selectorOrOptions;
  } else if (selectorOrOptions) {
    withMerged = selectorOrOptions.withMerged ?? false;
    selector = selectorArg;
  }

  return useBitriseYmlStore(({ yml }) => {
    let stepBundles = yml.step_bundles || {};

    if (withMerged && mergedYml?.step_bundles) {
      // Merged as base, active file overrides
      stepBundles = { ...mergedYml.step_bundles, ...stepBundles };
    }

    return selector ? selector(stepBundles) : stepBundles;
  }) as U;
}
