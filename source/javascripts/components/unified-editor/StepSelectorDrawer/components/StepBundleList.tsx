import { Button, EmptyState } from '@bitrise/bitkit';
import { useStepBundles } from '@/hooks/useStepBundles';
import StepBundleService from '@/core/services/StepBundleService';
import useNavigation from '@/hooks/useNavigation';
import useSearch from '../hooks/useSearch';
import { SelectStepHandlerFn } from '../StepSelectorDrawer.types';
import SelectableStepBundleCard from './SelectableStepBundleCard';

type StepBundleListProps = {
  onSelectStep: SelectStepHandlerFn;
  targetStepBundleId?: string;
};

const StepBundleList = ({ onSelectStep, targetStepBundleId }: StepBundleListProps) => {
  const stepBundles = useStepBundles();
  const stepBundleChains = StepBundleService.getStepBundleChains(stepBundles);
  const bundleIds = Object.keys(stepBundles).filter((id) => {
    if (targetStepBundleId) {
      return !stepBundleChains[id].includes(targetStepBundleId);
    }
    return true;
  });

  const filterStepBundles = useSearch((s) => s.stepBundleQuery);
  const setSearchStepBundle = useSearch((s) => s.setSearchStepBundle);
  const { replace } = useNavigation();

  const filteredItems = bundleIds.filter((id) => {
    const lowerCaseFilterString = filterStepBundles.toLowerCase();
    if (typeof id === 'string' && id.toLowerCase().includes(lowerCaseFilterString || '')) {
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
    filteredItems.map((id) => <SelectableStepBundleCard key={id} id={id} onClick={() => handleClick(id)} />)
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
