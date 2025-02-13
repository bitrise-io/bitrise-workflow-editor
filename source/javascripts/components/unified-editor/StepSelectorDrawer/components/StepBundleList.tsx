import { Button, EmptyState } from '@bitrise/bitkit';
import { useStepBundles } from '@/hooks/useStepBundles';
import StepBundleService from '@/core/models/StepBundleService';
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
    onSelectStep(`bundle::${id}`);
  };

  if (bundleIds.length === 0) {
    return (
      <EmptyState
        iconName="Steps"
        title="Your Step bundles will appear here"
        description="With Step bundles, you can create reusable chunks of configuration. You can create Step bundles in the YML."
      >
        <Button
          as="a"
          variant="tertiary"
          rightIconName="ArrowNorthEast"
          href="https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps/step-bundles.html"
          target="_blank"
        >
          Read documentations
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
