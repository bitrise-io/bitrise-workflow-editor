import { Button, EmptyState } from '@bitrise/bitkit';
import { useModalContext } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  SearchFormValues,
  SelectStepHandlerFn,
} from '@/components/unified-editor/StepSelectorDrawer/StepSelectorDrawer.types';
import SelectableStepBundleCard from '@/components/unified-editor/StepSelectorDrawer/components/SelectableStepBundleCard';

type StepBundleListProps = {
  onSelectStep: SelectStepHandlerFn;
};

const StepBundleList = (props: StepBundleListProps) => {
  const { onSelectStep } = props;
  const { yml } = useBitriseYmlStore((s) => ({ yml: s.yml }));
  const { onClose } = useModalContext();

  const { reset, watch } = useFormContext<SearchFormValues>();
  const { filterStepBundles } = watch();

  const stepBundlesLength = Object.keys(yml.step_bundles || {}).length;

  const filteredItems = Object.keys(yml.step_bundles || {}).filter((id) => {
    const lowerCaseFilterString = filterStepBundles?.toLowerCase();
    if (typeof id === 'string' && id.toLowerCase().includes(lowerCaseFilterString || '')) {
      return true;
    }
    return false;
  });

  const handleClick = (id: string) => {
    onSelectStep(`bundle::${id}`);
    onClose();
  };

  if (stepBundlesLength === 0) {
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
    filteredItems.map((id) => <SelectableStepBundleCard id={id} handleClick={() => handleClick(id)} key={id} />)
  ) : (
    <EmptyState
      iconName="Magnifier"
      title="No Step bundles are matching your filter"
      description="Modify your filters to get results."
      marginBlockStart="16"
    >
      <Button variant="secondary" onClick={() => reset()}>
        Clear filters
      </Button>
    </EmptyState>
  );
};

export default StepBundleList;
