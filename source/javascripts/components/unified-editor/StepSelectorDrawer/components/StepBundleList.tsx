import { Button, EmptyState } from '@bitrise/bitkit';

import StepBundleService from '@/core/services/StepBundleService';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useNavigation from '@/hooks/useNavigation';
import { useStepBundles } from '@/hooks/useStepBundles';

import useSearch from '../hooks/useSearch';
import { SelectStepHandlerFn } from '../StepSelectorDrawer.types';
import SelectableStepBundleCard from './SelectableStepBundleCard';

type StepBundleListProps = {
  onSelectStep: SelectStepHandlerFn;
  excludedStepBundleId?: string;
};

const StepBundleList = ({ onSelectStep, excludedStepBundleId }: StepBundleListProps) => {
  const entityIndex = useEntityIndex();
  const stepBundles = useStepBundles((s) => {
    return Object.fromEntries(
      Object.entries(s).map(([id, stepBundle]) => {
        return [id, { steps: stepBundle?.steps, title: stepBundle?.title }];
      }),
    );
  });

  // Active-file bundles unioned with bundles from other module files (one row per id).
  const allBundleIds = [...new Set([...Object.keys(stepBundles), ...Object.keys(entityIndex.stepBundles)])];

  // Chains only exist for local bundles, so guard the lookup; a cross-file bundle has no chain and can't be excluded.
  const stepBundleChains = StepBundleService.getStepBundleChains(stepBundles);
  const bundleIds = allBundleIds.filter((id) => {
    if (excludedStepBundleId) {
      // Exclude the bundle itself (direct self-reference — a chain never lists itself, and a
      // cross-file bundle has no chain at all) and any bundle whose chain already reaches it.
      return id !== excludedStepBundleId && !stepBundleChains[id]?.includes(excludedStepBundleId);
    }
    return true;
  });

  const filterStepBundles = useSearch((s) => s.stepBundleQuery);
  const setSearchStepBundle = useSearch((s) => s.setSearchStepBundle);
  const { replace } = useNavigation();

  const filteredItems = bundleIds.filter((id) => {
    const lowerCaseFilterString = filterStepBundles.toLowerCase();
    const title = stepBundles[id]?.title?.toLowerCase();
    if (id?.toLowerCase().includes(lowerCaseFilterString || '') || title?.includes(lowerCaseFilterString || '')) {
      return true;
    }
    return false;
  });

  const reset = () => {
    setSearchStepBundle('');
  };

  const handleClick = (id: string) => {
    onSelectStep(StepBundleService.idToCvs(id));
  };

  if (bundleIds.length === 0) {
    return (
      <EmptyState
        iconName="Steps"
        title="Your Step bundles will appear here"
        description="Create Step bundles directly in Workflows, or on the Step bundles page."
      >
        <Button variant="tertiary" rightIconName="ArrowNorthEast" onClick={() => replace('/step_bundles')}>
          Go to Step bundles
        </Button>
      </EmptyState>
    );
  }

  return filteredItems.length > 0 ? (
    filteredItems.map((id) => (
      <SelectableStepBundleCard key={id} id={id} onClick={() => handleClick(id)} title={stepBundles[id]?.title} />
    ))
  ) : (
    <EmptyState
      iconName="Magnifier"
      title="No Step bundles are matching your filter"
      description="Modify your filters to get results."
    >
      <Button variant="secondary" onClick={() => reset()}>
        Clear filters
      </Button>
    </EmptyState>
  );
};

export default StepBundleList;
